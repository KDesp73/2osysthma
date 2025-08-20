import { NextResponse } from "next/server";
import matter from "gray-matter";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { GithubHelper } from "@/lib/GithubHelper";

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

    // 3️⃣ Upload file via GitHub API
    const gh = new GithubHelper("KDesp73", "2osysthma");

    const putRes = await gh.upload(
        `public/content/blog/${slug}.md`,
        `Add blog post: ${title}`, 
        Buffer.from(frontmatter).toString("base64")
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
