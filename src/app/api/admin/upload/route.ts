import { NextResponse } from "next/server";
import matter from "gray-matter";
import { GithubHelper } from "@/lib/GithubHelper";
import { createSlug } from "@/lib/posts";

interface UploadItem {
  type: "blog" | "file" | "image";
  title?: string;        // for blog title or file title
  description?: string;  // optional description for blog/file
  author?: string;       // for blog
  tags?: string[];       // for blog
  content?: string;      // for blog
  name?: string;         // for file/image filename
  data?: string;         // base64 string for file/image
}

interface FileMetadata {
  filename: string;
  title: string;
  description: string;
}

async function blog(gh: GithubHelper, item: UploadItem) {
    if (!item.title || !item.content) {
        throw new Error("Blog items must have title and content");
    }

    const slug = createSlug(item.title);
    if (!slug) throw new Error("Cannot generate slug from title");

    try {
        await gh.getFile(`public/content/blog/${slug}.md`);
        throw new Error(`A blog post with the title "${item.title}" already exists.`);
    } catch (err: unknown) {
        if (!(err as Error).message.includes("Failed to fetch file")) {
            // If the error is not "file not found", rethrow
            throw err;
        }
    }

    const frontmatter = matter.stringify(item.content, {
        title: item.title,
        description: item.description,
        author: item.author,
        date: new Date().toISOString(),
        tags: item.tags,
        slug,
    });

    const res = await gh.upload(
        `public/content/blog/${slug}.md`,
        `Add blog post: ${item.title}`,
        Buffer.from(frontmatter).toString("base64")
    );

    if (!res.ok) throw new Error(`Failed to upload blog: ${item.title}`);
}

async function file(gh: GithubHelper, item: UploadItem) {
    if (!item.name || !item.data) {
        throw new Error("File items must have name and data");
    }

    const fileMetadataPath = "public/content/files/metadata.json";

    let currentMetadata: FileMetadata[] = [];
    try {
        const res = await gh.getFile(fileMetadataPath);
        if (res && res.content) {
            currentMetadata = JSON.parse(res.content);
        }
    } catch {
        console.log("No existing file metadata, creating new one.");
    }

    const res = await gh.uploadFile(
        `public/content/files/${item.name}`,
        `Uploaded file: ${item.name}`,
        Buffer.from(item.data, "base64")
    );
    if (!res.ok) throw new Error(`Failed to upload file: ${item.name}`);

    const existingIndex = currentMetadata.findIndex(
        (m) => m.filename === item.name
    );
    const metadataEntry: FileMetadata = {
        filename: item.name.replace(/ /g, "-"),
        title: item.title || item.name,
        description: item.description || "",
    };
    if (existingIndex >= 0) currentMetadata[existingIndex] = metadataEntry;
    else currentMetadata.push(metadataEntry);

    // upload updated file metadata
    await gh.uploadFile(
        fileMetadataPath,
        "Update metadata.json",
        Buffer.from(JSON.stringify(currentMetadata, null, 2))
    );
}

async function image(gh: GithubHelper, item: UploadItem) {
    if (!item.name || !item.data) {
        throw new Error("Image items must have name and data");
    }
    const res = await gh.uploadFile(
        `public/content/images/${item.name}`,
        `Uploaded image: ${item.name}`,
        Buffer.from(item.data, "base64")
    );
    if (!res.ok) throw new Error(`Failed to upload image: ${item.name}`);
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const items: UploadItem[] = body.items;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: "No items provided" },
                { status: 400 }
            );
        }

        const gh = new GithubHelper("KDesp73", "2osysthma");

        await Promise.all(items.map(item => {
            if (item.type === "blog") return blog(gh, item);
            if (item.type === "file") return file(gh, item);
            if (item.type === "image") return image(gh, item);
            throw new Error(`Unknown item type: ${item.type}`);
        }));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            error: (err as Error).message,
        });
    }
}

