import { NextResponse } from "next/server";
import matter from "gray-matter";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const APP_ID = process.env.GITHUB_APP_ID!;
const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, "\n");
const REPO_OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO_NAME = process.env.GITHUB_REPO_NAME!;
const BRANCH = "main";

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

function greekToLatin(str: string) {
  const map: Record<string, string> = {
    α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th",
    ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p",
    ρ: "r", σ: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
    ά: "a", έ: "e", ή: "i", ί: "i", ό: "o", ύ: "y", ώ: "o", ς: "s",
    Ά: "A", Έ: "E", Ή: "I", Ί: "I", Ό: "O", Ύ: "Y", Ώ: "O",
  };
  return str
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, author, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Missing title or content" },
        { status: 400 }
      );
    }

    // Create slug for filename
    const latinTitle = greekToLatin(title.toLowerCase());
    const slug = latinTitle
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

    if (!slug) {
        throw new Error("Cannot generate slug from title");
    }

    const frontmatter = matter.stringify(content, {
      title,
      description,
      author,
      date: new Date().toISOString(), // e.g. "2025-08-20T13:45:30.123Z"
      tags,
      slug,
    });

    // 1️⃣ Generate JWT for the GitHub App
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + 60, // 1 minute expiration
      iss: APP_ID,
    };
    const appJwt = jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });

    // 2️⃣ Get installation token
    // First, get the installation ID
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

    // Generate installation access token
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
    const installationToken = tokenData.token;

    // 3️⃣ Upload file via GitHub API
    const filePath = `public/content/blog/${slug}.md`;

    // Check if file exists to get SHA
    let sha: string | undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`,
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

    const putRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Add blog post: ${title}`,
          content: Buffer.from(frontmatter).toString("base64"),
          branch: BRANCH,
          sha,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      console.error(err);
      throw new Error("GitHub commit failed");
    }

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
