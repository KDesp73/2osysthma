import { GithubHelper } from "@/lib/GithubHelper";
import { NextRequest, NextResponse } from "next/server";

// Interfaces mirroring the final structure of metadata.json
interface MetadataImage {
    path: string; // e.g., /content/images/collectionA/image1.jpg
    index: number; // Kept as requested
}

interface MetadataFolder {
    name: string; // Collection name
    date: string; // Existing date is preserved (e.g., 2025-10-25)
    images: Array<MetadataImage>;
}

// Action type expected from the frontend when only handling deletions
interface ImageAction {
    type: 'delete';
    path: string; // The remote path to the file to delete (e.g., public/content/images/...)
}

/**
 * Helper to group flat image data into the nested structure for metadata.json.
 * This function preserves the original 'date' for existing collections, ensures
 * images are correctly sorted and indexed, and enforces a slugified collection
 * name (spaces to hyphens) in the final image path.
 * * @param flatMetadata The flattened list of all active images from the client.
 * @param existingCollectionsMap Map of existing collection names to their folder data, used for date lookup.
 * @returns The grouped metadata ready for serialization.
 */
const groupMetadata = (
    flatMetadata: Array<{ path: string; collection: string; index: number }>,
    existingCollectionsMap: Map<string, MetadataFolder>
): MetadataFolder[] => {
    const grouped: Record<string, MetadataFolder> = {};
    // Generate current date in the requested YYYY-MM-DD format (e.g., 2025-10-02)
    const now = new Date().toISOString().split('T')[0];

    // 1. Group images and determine collection dates
    flatMetadata.forEach(item => {
        const { collection, path, index } = item;

        // SLUGIFY COLLECTION NAME FOR PATH ENFORCEMENT
        // Note: Using the original collection name as the map key to ensure we match
        // the client's view, even if the path changes.
        const slugifiedCollection = collection.replace(/\s+/g, '-');

        // Extract the filename from the received path (e.g., "image.jpg")
        const parts = path.split('/');
        const filename = parts[parts.length - 1]; 

        // Reconstruct the definitive, slugified path
        const finalPath = `/content/images/${slugifiedCollection}/${filename}`;


        if (!grouped[collection]) {
            const existingFolder = existingCollectionsMap.get(collection);

            // Use existing date if collection already existed, otherwise use 'now'
            const dateToUse = existingFolder ? existingFolder.date : now;

            grouped[collection] = {
                name: collection,
                date: dateToUse,
                images: [],
            };
        }
        // Store the final, sanitized path and index
        grouped[collection].images.push({ path: finalPath, index });
    });

    // 2. Sort images within each folder and finalize the structure
    return Object.values(grouped).map(folder => {
        // Sort images by the provided client index (which reflects reordering)
        folder.images.sort((a, b) => a.index - b.index);

        // Map the sorted images, explicitly keeping the index as requested
        const cleanImages: MetadataImage[] = folder.images.map(({ path, index }) => ({ path, index }));

        return {
            name: folder.name,
            date: folder.date,
            images: cleanImages,
        };
    });
};

/**
 * Handles deletions and updates the global image metadata file (metadata.json).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { actions, newMetadata } = body as {
            actions: ImageAction[];
            newMetadata: Array<{ path: string; collection: string; index: number }>;
        };

        const gh = await GithubHelper.create();
        const metadataPath = "public/content/images/metadata.json";
        const pathsToDelete = actions.map(a => a.path).filter((p): p is string => !!p);

        let success = true;

        // --- Step 0: Read existing metadata for date preservation ---
        let existingCollectionsMap = new Map<string, MetadataFolder>();
        try {
            // Using gh.getFile to read the existing metadata content
            const existingContent = await gh.getFile(metadataPath);
            const existingFolders: MetadataFolder[] = JSON.parse(existingContent.content);
            existingCollectionsMap = new Map(existingFolders.map(f => [f.name, f]));
        } catch (e) {
            // This is non-critical. If the file doesn't exist or fails to parse, we assume all are new collections.
            console.warn(`Metadata file not found or failed to parse, starting with an empty map.`);
        }

        // --- Step 1: Handle Deletions ---
        if (pathsToDelete.length > 0) {
            const commitMessage = `Image Manager: Deleted ${pathsToDelete.length} image file(s).`;
            try {
                // Use gh.remove to delete the files from the remote repository
                await gh.remove(pathsToDelete, commitMessage);
            } catch (err: unknown) {
                console.error("Failed to delete files:", err);
                // We mark success as false but continue to update metadata
                success = false;
            }
        }

        // --- Step 2: Prepare and Write new metadata.json ---
        const groupedMetadata = groupMetadata(newMetadata, existingCollectionsMap);
        const jsonContent = JSON.stringify(groupedMetadata, null, 2);

        const finalCommitMessage = `Image Manager: Update metadata file (Deletions: ${pathsToDelete.length}).`;

        try {
            const metadataRes = await gh.upload(
                [{
                    remotePath: metadataPath,
                    content: jsonContent,
                    encoding: "utf-8" 
                }],
                finalCommitMessage
            );
            if (metadataRes.status < 200 || metadataRes.status >= 300) {
                throw new Error(`GitHub metadata write failed with status ${metadataRes.status}`);
            }
        } catch (err: unknown) {
            console.error(
                "Failed to write metadata.json:",
                err instanceof Error ? err.message : JSON.stringify(err),
            );
            // If metadata write fails, it's a critical error
            throw new Error("Failed to write updated metadata file.");
        }

        // --- Step 3: Return success response ---
        return NextResponse.json({ success: success, message: "Image management changes saved (deletions and metadata updated)." });

    } catch (err) {
        console.error("API Error in /api/admin/edit-images:", err);
        return NextResponse.json(
            { success: false, error: (err as Error).message },
            { status: 500 },
        );
    }
}
