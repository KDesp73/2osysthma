import { GithubHelper } from "@/lib/GithubHelper";
import { NextRequest, NextResponse } from "next/server";

// Interfaces mirroring the final flat structure of metadata.json
interface FileMetadata {
  filename: string;
  title: string;
  description: string;
}

// Data received from the frontend for active, updated files
interface NewFileMetadata extends FileMetadata {
  index: number; // Kept for consistency/order check from client
}

// Action type expected from the frontend when handling deletions
interface FileAction {
  type: "delete";
  path: string; // The remote path to the file to delete (e.g., public/content/files/...)
}

/**
 * Handles deletions and updates the global file metadata file (metadata.json).
 * It expects a flat array of remaining files (newMetadata) and an array of files/paths to delete (actions).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actions, newMetadata } = body as {
      actions: FileAction[];
      newMetadata: Array<NewFileMetadata>;
    };

    const gh = await GithubHelper.create();
    // *** Updated path for file metadata ***
    const metadataPath = "public/content/files/metadata.json";

    const pathsToDelete = actions
    .map((a) => a.path)
    .filter((p): p is string => !!p);

    let success = true;

    // --- Step 1: Handle Deletions ---
    if (pathsToDelete.length > 0) {
      const commitMessage = `File Manager: Deleted ${pathsToDelete.length} file(s).`;
      try {
        // Use gh.remove to delete the files from the remote repository
        // FIXME: removing file fails
        await gh.remove(pathsToDelete, commitMessage);
        console.log(`Successfully deleted ${pathsToDelete.length} files.`);
      } catch (err: unknown) {
        console.error("Failed to delete files:", err);
        // We mark success as false but continue to update metadata
        success = false;
      }
    }

    // --- Step 2: Prepare and Write new metadata.json (Flat structure) ---

    // The file metadata is a flat array. We only save the core fields (filename, title, description).
    const finalMetadataForFile: FileMetadata[] = newMetadata.map(f => ({
      filename: f.filename,
      title: f.title,
      description: f.description
    }));

    const jsonContent = JSON.stringify(finalMetadataForFile, null, 2);

    const finalCommitMessage = `File Manager: Update metadata file (Deletions: ${pathsToDelete.length}).`;

    try {
      const metadataRes = await gh.upload(
        [
          {
            remotePath: metadataPath,
            content: jsonContent,
            encoding: "utf-8",
          },
        ],
        finalCommitMessage,
      );
      if (metadataRes.status < 200 || metadataRes.status >= 300) {
        throw new Error(
          `GitHub metadata write failed with status ${metadataRes.status}`,
        );
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
    return NextResponse.json({
      success: success,
      message:
        "File management changes saved (deletions and metadata updated).",
    });
  } catch (err) {
    console.error("API Error in /api/admin/edit-files:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

