import jwt from "jsonwebtoken";

type GitHubFileCheckResponse = {
    sha: string;
    url: string;
    content: string;
    encoding: string;
};

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
    branch: string = "main";

    constructor(owner: string, repo: string, branch?: string) {
        this.owner = owner;
        this.repo = repo;
        if(branch === 'undefined' ||branch === null) {
            this.branch = branch!;
        }
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
            }
        );
        const installations = await installationsRes.json() as GitHubInstallation[];
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
            }
        );
        const tokenData = await tokenRes.json() as GitHubInstallationTokenResponse;

        return tokenData.token;
    }

    async upload(remotePath: string, commitMsg: string, content: string): Promise<Response>{
        const installationToken = await this.getInstallationToken();
        let sha: string | undefined;
        const checkRes = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${remotePath}?ref=${this.branch}`,
                {
                headers: {
                    Authorization: `Bearer ${installationToken}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );
        if (checkRes.ok) {
            const checkData = await checkRes.json() as GitHubFileCheckResponse;
            sha = checkData.sha;
        }

        return fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${remotePath}`,
                {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${installationToken}`,
                    Accept: "application/vnd.github+json",
                },
                body: JSON.stringify({
                    message: commitMsg,
                    content: content,
                    branch: this.branch,
                    sha,
                }),
            }
        );
    }

    async removeFile(remotePath: string, commitMsg: string): Promise<Response> {
        const installationToken = await this.getInstallationToken();

        const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${remotePath}?ref=${this.branch}`;
            console.log(url);
        const checkRes = await fetch(
            url,
            {
                headers: {
                    Authorization: `Bearer ${installationToken}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );

        if (!checkRes.ok) {
            throw new Error(`File not found: ${remotePath}`);
        }

        const checkData = (await checkRes.json()) as GitHubFileCheckResponse;
        const sha = checkData.sha;

        // Delete request
        return fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${remotePath}`,
                {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${installationToken}`,
                    Accept: "application/vnd.github+json",
                },
                body: JSON.stringify({
                    message: commitMsg,
                    branch: this.branch,
                    sha,
                }),
            }
        );
    }

    async uploadFile(
        remotePath: string,
        commitMsg: string,
        file: Buffer | ArrayBuffer | Uint8Array
    ): Promise<Response> {
        let buffer: Buffer;
        if (file instanceof ArrayBuffer) { 
            buffer = Buffer.from(file); 
        } else if (file instanceof Uint8Array) { 
            buffer = Buffer.from(file); 
        } else { 
            buffer = file; 
        }

        const base64Content = buffer.toString("base64");

        const safePath = remotePath.replace(/ /g, "-");

        return this.upload(safePath, commitMsg, base64Content);
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
            throw new Error(`Failed to fetch file: ${remotePath}, status: ${res.status}`);
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
        return commits.map((c: any) => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
            url: c.html_url,
        }));
    }

}
