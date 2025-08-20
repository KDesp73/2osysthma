import { NextResponse } from "next/server";
import matter from "gray-matter";

const GITHUB_REPO = "KDesp73/2osysthma";
const BRANCH = "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function POST(req: Request) {
    const body = await req.json();
    const { title, description, author, content, tags } = body;

    if (!title || !content) {
        return NextResponse.json(
            { success: false, error: "Missing title or content" },
            { status: 400 }
        );
    }

    const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

    const frontmatter = matter.stringify(content, {
        title,
        description,
        author,
        date: new Date().toISOString().split("T")[0],
        tags,
        slug,
    });

    const filePath = `public/content/blog/${slug}.md`;

    console.log(GITHUB_TOKEN);
    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
            {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: `Add blog post: ${title}`,
                content: Buffer.from(frontmatter).toString("base64"),
                branch: BRANCH,
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json();
        console.log("Github commit failed: ", err.message);
        return NextResponse.json(
            { success: false, error: err.message || "GitHub commit failed" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, slug });
}
