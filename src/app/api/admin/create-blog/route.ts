import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, description, author, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Missing title or content" }, { status: 400 });
    }

    // Slugify title for filename
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const blogDir = path.join(process.cwd(), "public", "content", "blog");
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    const filePath = path.join(blogDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: "Blog with this title already exists" }, { status: 400 });
    }

    const frontmatter = matter.stringify(content, {
      title,
      description,
      author,
      date: new Date().toISOString().split("T")[0],
      tags,
      slug,
    });

    fs.writeFileSync(filePath, frontmatter, "utf-8");

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
