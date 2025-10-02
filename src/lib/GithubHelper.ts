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
    files: { remotePath: string; content: string; encoding: "utf-8" | "base64" }[],
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
   * Removes one or more files in a single commit.
   * @param paths An array of file paths to remove.
   * @param commitMsg The message for the commit.
   * @returns The response from updating the ref.
   */
  async remove(paths: string[], commitMsg: string) {
    if (!paths.length) throw new Error("No files specified");

    // 1. Get the latest commit SHA and its tree SHA (same steps as upload)
    const latest = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
    });
    const latestCommitSha = latest.data.object.sha;

    const commit = await this.octokit.git.getCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: latestCommitSha,
    });

    // 2. Create a new Tree, based on the latest commit's tree, removing files
    // To remove a file, you set its SHA to null.
    const tree = await this.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: commit.data.tree.sha,
      tree: paths.map((p) => ({
        path: p,
        // mode and type are still required but the key is sha: null
        mode: "100644" as const,
        type: "blob" as const,
        sha: null, // This is what marks a file for deletion
      })),
    });

    // 3. Create a new Commit, pointing to the new Tree
    const newCommit = await this.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: commitMsg,
      tree: tree.data.sha,
      parents: [latestCommitSha],
    });

    // 4. Update the branch's reference to point to the new commit
    return this.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: newCommit.data.sha,
    });
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
