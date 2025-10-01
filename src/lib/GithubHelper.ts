import jwt from "jsonwebtoken";

export type ContentType = Buffer | ArrayBuffer | Uint8Array | string;

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
    this.owner = owner ?? process.env.GITHUB_USER!;
    this.repo = repo ?? process.env.GITHUB_REPO!;
    this.branch = branch ?? process.env.GITHUB_BRANCH ?? "main";
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
    files: { remotePath: string; content: Buffer | ArrayBuffer | Uint8Array | string }[],
    commitMsg: string,
  ): Promise<Response> {
    const installationToken = await this.getInstallationToken();

    // --- 1. Get latest commit SHA and tree ---
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

    // --- 2. Prepare tree objects ---
    const tree = files.map(({ remotePath, content }) => {
      let base64Content: string;

      if (Buffer.isBuffer(content)) {
        base64Content = content.toString('base64');
      } else if (content instanceof ArrayBuffer) {
        base64Content = Buffer.from(content).toString('base64');
      } else if (content instanceof Uint8Array) {
        base64Content = Buffer.from(content).toString('base64');
      } else if (typeof content === 'string') {
        return {
          path: remotePath.replace(/ /g, "-"),
          mode: "100644",
          type: "blob",
          content: content,
        };
      } else {
        throw new Error(`Unsupported content type for file ${remotePath}`);
      }

      return {
        path: remotePath.replace(/ /g, "-"),
        mode: "100644",
        type: "blob",
        content: base64Content,
        encoding: "base64",
      };
    });

    // --- 3. Create new tree (unchanged) ---
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

    // --- 4. Create commit (unchanged) ---
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

    // --- 5. Update branch ref (unchanged) ---
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
    const headers = (token: string) => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    });

    const checkResponse = async (res: Response, step: string) => {
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`GitHub API Error during ${step}: ${res.status} ${res.statusText}\nDetails: ${errorBody}`);
      }
    };

    // 1. Get latest commit SHA
    const refUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`;
      const refRes = await fetch(refUrl, { headers: headers(installationToken) });
    await checkResponse(refRes, "fetching branch ref");
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // 2. Get the latest commit tree SHA
    const commitUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits/${latestCommitSha}`;
      const commitRes = await fetch(commitUrl, { headers: headers(installationToken) });
    await checkResponse(commitRes, "fetching latest commit");
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Build a new tree that explicitly deletes the files
    const deleteEntries = paths.map(path => ({
      path,
      mode: "100644", // or "100755" if executable, "040000" for dirs
      type: "blob",
      sha: null, // this is the key: null SHA = remove
    }));

    // 4. Create new tree
    const createTreeRes = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`, {
      method: "POST",
    headers: headers(installationToken),
    body: JSON.stringify({ base_tree: baseTreeSha, tree: deleteEntries }),
    });
    await checkResponse(createTreeRes, "creating new tree");
    const createdTreeData = await createTreeRes.json();

    // 5. Create new commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`, {
      method: "POST",
    headers: headers(installationToken),
    body: JSON.stringify({
      message: commitMsg,
      tree: createdTreeData.sha,
      parents: [latestCommitSha],
    }),
    });
    await checkResponse(newCommitRes, "creating new commit");
    const newCommitData = await newCommitRes.json();

    // 6. Update branch ref
    const updateRefRes = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`, {
      method: "PATCH",
    headers: headers(installationToken),
    body: JSON.stringify({ sha: newCommitData.sha }),
    });
    await checkResponse(updateRefRes, "updating branch ref");

    return updateRefRes;
  }
}
