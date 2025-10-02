import { GithubHelper } from "@/lib/GithubHelper";
import { NextRequest, NextResponse } from "next/server";

// Interfaces mirroring the structure of metadata.json
interface MetadataImage {
  path: string; // e.g., /content/images/collectionA/image1.jpg
  index?: number; // Optional index used during grouping/sorting
}

interface MetadataFolder {
  name: string; // Collection name
  date: string; // Date of creation/last modification (simplified to current time)
  images: Array<MetadataImage>;
}

// Action type expected from the frontend when only handling deletions
interface ImageAction {
    type: 'delete'; 
    path: string; // The remote path to the file to delete (e.g., public/content/images/...)
}

/**
 * Helper to group flat image data into the nested structure for metadata.json.
 * This is where reordering (based on 'index') is preserved.
 * @param flatMetadata The flattened list of all active images.
 * @returns The grouped metadata ready for serialization.
 */
const groupMetadata = (flatMetadata: Array<{ path: string; collection: string; index: number }>): MetadataFolder[] => {
  const grouped: Record<string, MetadataFolder> = {};
  const now = new Date().toISOString(); 

  flatMetadata.forEach(item => {
    const { collection, path, index } = item;
    if (!grouped[collection]) {
      grouped[collection] = {
        name: collection,
        date: now,
        images: [],
      };
    }
    grouped[collection].images.push({ path, index });
  });

  return Object.values(grouped).map(folder => {
    // Sort images by the provided client index (which reflects reordering)
    folder.images.sort((a, b) => (a.index || 0) - (b.index || 0));
    
    // Remove the temporary 'index' property before saving
    const cleanImages: MetadataImage[] = folder.images.map(({ path }) => ({ path }));
    
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
    const pathsToDelete = actions.map(a => a.path).filter((p): p is string => !!p);
    
    let commitMessage = "Image Manager: Updated metadata.json";
    let success = true;

    // 1. Handle Deletions (Critical Step for the Frontend's intent)
    if (pathsToDelete.length > 0) {
        commitMessage = `Image Manager: Deleted ${pathsToDelete.length} image file(s).`;
        try {
            // Use gh.remove to delete the files from the remote repository
            await gh.remove(pathsToDelete, commitMessage);
        } catch (err: unknown) {
            console.error("Failed to delete files:", err);
            success = false;
        }
    }
    
    const groupedMetadata = groupMetadata(newMetadata);
    const metadataPath = "public/content/images/metadata.json";
    const content = JSON.stringify(groupedMetadata, null, 2);
    
    // Create a specific commit message for the metadata update
    const finalCommitMessage = `Image Manager: Update metadata file (Deletions: ${pathsToDelete.length}).`;

    try {
      const metadataRes = await gh.upload(
        [{
          remotePath: metadataPath,
          content,
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
    
    // 3. Return success response
    return NextResponse.json({ success: success, message: "Image management changes saved (deletions and metadata updated)." });

  } catch (err) {
    console.error("API Error in /api/admin/edit-images:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
