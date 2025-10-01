import jwt from "jsonwebtoken";

type GitHubFileCheckResponse = {
  sha: string;
  url: string;
  content: string;
  encoding: string;
};

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

type GitHubInstallationTokenResponse = {
  token: string;
  expires_at: string;
  permissions: Record<string, string>;
  repository_selection: string;
};

type GitHubInstallation = {
  id: number;
  account: {
    login: string;
    id: number;
    type: string; // "User" or "Organization"
  };
  repository_selection: string;
  access_tokens_url: string;
  repositories_url: string;
  app_id: number;
  target_id: number;
  target_type: string;
  permissions: Record<string, string>;
  events: string[];
  created_at: string;
  updated_at: string;
  single_file_name: string | null;
  has_multiple_single_files?: boolean;
};

export class GithubHelper {
  owner: string;
  repo: string;
  branch: string;

  constructor(owner?: string, repo?: string, branch?: string) {
    this.owner = owner ?? process.env.GITHUB_REPO_OWNER!;
    this.repo = repo ?? process.env.GITHUB_REPO_NAME!;
    this.branch = branch ?? "main";
  }

  genJwt(): string {
    const APP_ID = process.env.GITHUB_APP_ID!;
    const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, "\n");

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + 60, // 1 minute expiration
      iss: APP_ID,
    };
    return jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
  }

  async getInstallationToken(): Promise<string> {
    const appJwt = this.genJwt();
    const installationsRes = await fetch(
      `https://api.github.com/app/installations`,
      {
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    const installations =
      (await installationsRes.json()) as GitHubInstallation[];
    if (!installations.length) {
      throw new Error("No installations found for this app");
    }
    const installationId = installations[0].id;

    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    const tokenData =
      (await tokenRes.json()) as GitHubInstallationTokenResponse;

    return tokenData.token;
  }

  async getFile(remotePath: string): Promise<GitHubFileCheckResponse> {
    const installationToken = await this.getInstallationToken();

    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${remotePath}?ref=${this.branch}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${installationToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch file: ${remotePath}, status: ${res.status}`,
      );
    }

    const data = (await res.json()) as GitHubFileCheckResponse;

    if (data.content && data.encoding === "base64") {
      data.content = Buffer.from(data.content, "base64").toString("utf-8");
    }

    return data;
  }

  async getGitHistory(path?: string, perPage: number = 50, page: number = 1) {
    const installationToken = await this.getInstallationToken();

    let url = `https://api.github.com/repos/${this.owner}/${this.repo}/commits?sha=${this.branch}&per_page=${perPage}&page=${page}`;
    if (path) {
      url += `&path=${encodeURIComponent(path)}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${installationToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch git history: ${res.status}`);
    }

    const commits = await res.json();
    return commits.map((c: GitHubCommit) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
      url: c.html_url,
    }));
  }

  async upload(
    files: { remotePath: string; content: Buffer | ArrayBuffer | Uint8Array }[],
    commitMsg: string,
  ): Promise<Response> {
    const installationToken = await this.getInstallationToken();

    // Get latest commit SHA and tree
    const refRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`,
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // Prepare tree objects
    const tree = files.map(({ remotePath, content }) => {
      let buffer: Buffer;
      if (content instanceof ArrayBuffer) buffer = Buffer.from(content);
      else if (content instanceof Uint8Array) buffer = Buffer.from(content);
      else buffer = content;

      return {
        path: remotePath.replace(/ /g, "-"),
        mode: "100644",
        type: "blob",
        content: buffer.toString("base64"),
        encoding: "base64",
      };
    });

    // Create new tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ base_tree: baseTreeSha, tree }),
      },
    );
    const treeData = await treeRes.json();

    // Create commit
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: commitMsg,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      },
    );
    const newCommitData = await newCommitRes.json();

    // Update branch ref
    return fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ sha: newCommitData.sha }),
      },
    );
  }

  async remove(paths: string[], commitMsg: string): Promise<Response> {
    if (!paths.length) throw new Error("No files specified for removal");

    const installationToken = await this.getInstallationToken();

    // Get latest commit SHA and tree
    const refRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`,
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // Prepare tree with `null` content to delete files
    const tree = paths.map((remotePath) => ({
      path: remotePath.replace(/ /g, "-"),
      mode: "100644",
      type: "blob",
      sha: null, // deletion
    }));

    // Create tree for deletion
    const treeRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ base_tree: baseTreeSha, tree }),
      },
    );
    const treeData = await treeRes.json();

    // Create commit
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: commitMsg,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      },
    );
    const newCommitData = await newCommitRes.json();

    // Update branch ref
    return fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ sha: newCommitData.sha }),
      },
    );
  }
}
