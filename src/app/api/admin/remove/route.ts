import { GithubHelper } from "@/lib/GithubHelper";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles bulk deletion of files and assets (e.g., images, posts)
 * from the GitHub repository.
 *
 * The request body must contain:
 * 1. paths: string[] - An array of full file paths to be removed (e.g., "public/content/images/collection/my-image.jpg").
 * 2. commitMessage: string - The message for the GitHub commit.
 *
 * @param req The NextRequest object containing the paths to delete.
 * @returns A NextResponse indicating success or failure.
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1. Parse the request body to get the file paths and the commit message
    const body = await req.json();
    const { paths, commitMessage } = body as {
      paths: string[];
      commitMessage: string;
    };

    if (!paths || paths.length === 0) {
      return NextResponse.json(
        { success: false, error: "The 'paths' array must not be empty." },
        { status: 400 },
      );
    }

    // 2. Initialize the GitHub Helper
    const gh = await GithubHelper.create();

    let res;
    try {
      // 3. Call gh.remove with the array of paths and the provided commit message.
      // The client (frontend) is responsible for compiling the list of paths,
      // which might include multiple images or posts.
      res = await gh.remove(paths, commitMessage);
    } catch (err: unknown) {
      console.error(
        "GitHub removal operation failed:",
        err instanceof Error ? err.message : JSON.stringify(err),
      );
      // Re-throw to be caught by the outer try/catch
      throw new Error(err instanceof Error ? err.message : JSON.stringify(err));
    }

    // 4. Check for successful status (2xx status codes)
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`GitHub operation failed with status ${res.status}`);
    }

    return NextResponse.json({ success: true, ...res });
  } catch (err) {
    console.error("Deletion endpoint error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
