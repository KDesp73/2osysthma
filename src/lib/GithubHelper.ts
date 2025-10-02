import { Octokit } from "@octokit/rest";
import { App } from "@octokit/app";

export interface CommitHistoryItem {
  sha: string;
  message: string;
  author: { name: string | null; email: string | null; date: string | null };
  committer: { name: string | null; email: string | null; date: string | null };
  html_url: string;
}

export type ContentType = string;

// A unique symbol used to signal an internal, safe call to the constructor
const InternalCreate = Symbol("InternalCreate");

/**
 * A helper class for interacting with GitHub repositories using a GitHub App installation.
 */
export class GithubHelper {
  private octokit!: Octokit;
  private owner!: string;
  private repo!: string;
  private branch!: string;

  /**
   * Private constructor to ensure instantiation only happens via the async factory.
   * @param internalFlag Must be the InternalCreate Symbol for successful creation.
   */
  private constructor(internalFlag?: symbol) {
    if (internalFlag !== InternalCreate) {
      throw new Error(
        "Cannot instantiate GithubHelper directly. Use the async factory method `GithubHelper.create()`.",
      );
    }
  }

  /**
   * Factory method to create an authenticated GithubHelper instance.
   */
  static async create(
    owner?: string,
    repo?: string,
    branch?: string,
  ): Promise<GithubHelper> {
    const helper = new GithubHelper(InternalCreate);

    // Set up properties
    helper.owner = owner ?? process.env.GITHUB_USER!;
    helper.repo = repo ?? process.env.GITHUB_REPO!;
    helper.branch = branch ?? process.env.GITHUB_BRANCH ?? "main";

    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY;
    const installationId = process.env.GITHUB_INSTALLATION_ID;

    if (!appId || !privateKey || !installationId) {
      throw new Error(
        "Missing one or more required GitHub App environment variables: GITHUB_APP_ID, GITHUB_PRIVATE_KEY, or GITHUB_INSTALLATION_ID.",
      );
    }

    // 1. Create the App instance
    const app = new App({
      appId: appId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      Octokit: Octokit,
    });

    // 2. Get the Installation Octokit instance
    helper.octokit = await app.getInstallationOctokit(Number(installationId));

    return helper;
  }

  /**
   * Retrieves the content of a file from the repository.
   * @param remotePath The path to the file in the repository.
   * @returns An object containing the file's SHA and content.
   */
  async getFile(remotePath: string) {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path: remotePath,
      ref: this.branch,
    });

    if (!("content" in data) || Array.isArray(data)) {
      throw new Error("Path is not a file or does not exist");
    }

    return {
      sha: data.sha,
      content: Buffer.from(
        data.content,
        data.encoding as BufferEncoding,
      ).toString("utf-8"),
    };
  }

  /**
   * Uploads or updates multiple files in a single commit.
   * This uses the Git Data API (Blobs, Trees, Commits) for atomic changes.
   * @param files An array of objects containing the remote path and content for each file.
   * @param commitMsg The message for the commit.
   * @returns The response from updating the ref.
   */
  async upload(
    files: {
      remotePath: string;
      content: string;
      encoding: "utf-8" | "base64";
    }[],
    commitMsg: string,
  ) {
    // 1. Get the latest commit SHA of the branch
    const latest = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
    });
    const latestCommitSha = latest.data.object.sha;

    // 2. Get the tree SHA of the latest commit
    const commit = await this.octokit.git.getCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: latestCommitSha,
    });

    // 3. Create Blobs for all new/updated files (THE FIX IS HERE)
    const treeItems = await Promise.all(
      // Destructure 'encoding' from the file object
      files.map(async ({ remotePath, content, encoding }) => {
        // Use the explicitly provided content string and encoding.
        // The Base64 image data is now correctly identified as 'base64'
        // and the metadata JSON as 'utf-8'.
        const blob = await this.octokit.git.createBlob({
          owner: this.owner,
          repo: this.repo,
          content: content,
          encoding: encoding, // <-- CRITICAL: Use the passed-in encoding
        });

        return {
          path: remotePath,
          mode: "100644" as const,
          type: "blob" as const,
          sha: blob.data.sha,
        };
      }),
    );

    // 4. Create a new Tree, based on the latest commit's tree, adding the new file Blobs
    const tree = await this.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: commit.data.tree.sha,
      tree: treeItems,
    });

    // 5. Create a new Commit, pointing to the new Tree and the latest commit as parent
    const newCommit = await this.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: commitMsg,
      tree: tree.data.sha,
      parents: [latestCommitSha],
    });

    // 6. Update the branch's reference to point to the new commit
    return this.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: newCommit.data.sha,
    });
  }

  /**
   * Safely removes files from the repository by creating a new tree based on the latest commit.
   * It defensively checks if the files exist in the base tree before attempting deletion,
   * which prevents the 422 BadObjectState error if the file is already gone or the path is slightly wrong.
   */
  async remove(pathsToDelete: string[], commitMessage: string): Promise<void> {
    if (pathsToDelete.length === 0) {
      console.log("No files to delete.");
      return;
    }

    const latestCommit = await this.getLatestCommit();
    const baseTreeSha = latestCommit.data.tree.sha;

    // 1. Get the full tree of the latest commit recursively.
    const { data: baseTree } = await this.octokit.git.getTree({
      owner: this.owner,
      repo: this.repo,
      tree_sha: baseTreeSha,
      recursive: "true" // CRITICAL: Fetch the entire file structure
    });

    // Create a Set for fast lookup of existing file paths
    const existingPaths = new Set(baseTree.tree.map(item => item.path));
    const deleteInstructions = [];
    let filesActuallyFound = 0;

    // 2. Filter paths and create deletion instructions (setting SHA to null)
    for (const remotePath of pathsToDelete) {
      // The path being tracked by the client is the "public/" version.
      // The path in the Git Tree (which is what baseTree.tree uses) is relative to the repo root, 
      // so we strip the 'public/' prefix to match the Git tree paths.
      const gitPath = remotePath.startsWith('public/') 
        ? remotePath.substring(7) 
        : remotePath;

        // Check if the file exists in the current Git tree
        if (existingPaths.has(gitPath)) {
          // If found, add the deletion instruction using the Git path
          deleteInstructions.push({
            path: gitPath,
            mode: '100644' as const,
            sha: null, // Instruction for deletion
          });
          filesActuallyFound++;
        } else {
          // Skip deletion for files that are already gone or have a mismatched path
          console.warn(`[GithubHelper] WARNING: File path not found in Git tree: ${gitPath}. Skipping deletion instruction.`);
        }
    }

    if (filesActuallyFound === 0) {
      console.log("None of the requested files for deletion were found in the repository. Skipping commit.");
      return;
    }

    // 3. Create a new Tree using the filtered, safe deletion instructions
    const { data: newTree } = await this.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: baseTreeSha,
      tree: deleteInstructions,
    });

    // 4. Create the Commit and update the branch reference
    const { data: commit } = await this.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [latestCommit.sha],
    });

    await this.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: commit.sha,
    });
  }

  /**
   * Retrieves the latest commit object for the currently configured branch.
   * This commit object is required to identify the base tree for creating new changes (uploads, deletes).
   * * @returns The Octokit commit response object, containing the commit SHA and tree SHA.
   */
  async getLatestCommit(): Promise<Awaited<ReturnType<typeof this.octokit.git.getCommit>>> {
    try {
      // 1. Get the branch reference to find the SHA of the latest commit
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        // Fetch the head of the current branch (e.g., 'heads/main')
        ref: `heads/${this.branch}`, 
      });

      const commitSha = ref.object.sha;

      // 2. Get the full commit object using the SHA
      // This object contains the SHA of the commit's corresponding tree, which is needed for modifications.
      const commit = await this.octokit.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: commitSha,
      });

      return commit;
    } catch (error) {
      console.error("Error retrieving latest commit:", error);
      throw new Error("Failed to get the latest commit from the repository.");
    }
  }

  /**
   * Retrieves the commit history for the current branch.
   * @param remotePath Optional: Only list commits that touch this path.
   * @param count The number of commits to retrieve (max 100).
   * @returns A list of commit history items.
   */
  async getHistory(
    remotePath: string = "",
      count: number = 10,
  ): Promise<CommitHistoryItem[]> {
      const { data } = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: this.branch, // The commit SHA or branch name to start from
        path: remotePath, // Filters commits by file path
        per_page: Math.min(count, 100), // Enforce a max limit
      });

      // Map the Octokit response to the simplified type
      return data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        // Note: commit.author and commit.committer might be null if the user is deleted
        author: {
          name: commit.commit.author?.name ?? null,
          email: commit.commit.author?.email ?? null,
          date: commit.commit.author?.date ?? null,
        },
        committer: {
          name: commit.commit.committer?.name ?? null,
          email: commit.commit.committer?.email ?? null,
          date: commit.commit.committer?.date ?? null,
        },
        html_url: commit.html_url,
      }));
    }
}
