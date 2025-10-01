import { NextResponse } from "next/server";
import matter from "gray-matter";
import { ContentType, GithubHelper } from "@/lib/GithubHelper";
import { createSlug } from "@/lib/posts";
import { CollectionMetadata, FileMetadata, ImageMetadata } from "@/lib/metadata";

interface UploadItem {
  type: "blog" | "file" | "image";
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  content?: string;
  name?: string; // filename
  data?: string; // base64 string
  collection?: string; // for images
}

// --- BLOG ---
async function blog(item: UploadItem) {
  if (!item.title || !item.content)
    throw new Error("Blog items must have title and content");

  const slug = createSlug(item.title);
  if (!slug) throw new Error("Cannot generate slug from title");

  const frontmatter = matter.stringify(item.content, {
    title: item.title,
    description: item.description,
    author: item.author,
    date: new Date().toISOString(),
    tags: item.tags,
    slug,
  });

  return {
    commitMsg: `Posted '${item.title}'`,
    file: {
      remotePath: `public/content/blog/${slug}.md`,
      content: frontmatter,
    },
  } as ReturnType;
}

// --- FILE ---
async function file(item: UploadItem, existingMetadata: FileMetadata[] = []) {
  if (!item.name || !item.data)
    throw new Error("File items must have name and data");

  const metadata: FileMetadata[] = [...existingMetadata];

  const entry: FileMetadata = {
    filename: item.name.replace(/ /g, "-"),
    title: item.title || item.name,
    description: item.description || "",
  };

  const idx = metadata.findIndex((m) => m.filename === item.name);
  if (idx >= 0) metadata[idx] = entry;
  else metadata.push(entry);

  return {
    commitMsg: `Uploaded file '${item.name}'`,
    file:{
      remotePath: `public/content/files/${item.name}`,
      content: Buffer.from(item.data, "base64"),
    },
    metadata
  } as ReturnType;
}

// --- IMAGE ---
async function image(
  item: UploadItem,
  existingMetadata: CollectionMetadata[] = [],
) {
  if (!item.name || !item.data)
    throw new Error("Image items must have name and data");
  if (!item.collection) throw new Error("Image items must have a collection");

  const metadata: CollectionMetadata[] = [...existingMetadata];

  let collection = metadata.find((c) => c.name === item.collection);
  if (!collection) {
    collection = {
      name: item.collection,
      date: new Date().toISOString().split("T")[0],
      images: [],
    };
    metadata.push(collection);
  }

  const nextIndex = collection.images.length;
  collection.images.push({
    path: `/content/images/${item.collection}/${item.name}`,
    index: nextIndex,
  });

  return {
    commitMsg: `Uploaded image '${item.name}'`,
    file: {
      remotePath: `public/content/images/${item.collection}/${item.name}`,
      content: Buffer.from(item.data, "base64"),
    },
    metadata: metadata
  } as ReturnType;
}

interface FileType {
  remotePath: string;
  content: ContentType;
}

interface ReturnType {
  commitMsg?: string;
  file: FileType;
  metadata?: CollectionMetadata[] | FileMetadata[];
}

// --- POST HANDLER ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: UploadItem[] = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items provided" },
        { status: 400 },
      );
    }

    const gh = new GithubHelper();

    const filesToUpload: FileType[] = [];

    // Load existing metadata once
    let fileMetadata: FileMetadata[] = [];
    let imageMetadata: CollectionMetadata[] = [];

    try {
      const fileMetaRes = await gh.getFile("public/content/files/metadata.json");
      if (fileMetaRes?.content) fileMetadata = JSON.parse(fileMetaRes.content);
    } catch {}

    try {
      const imageMetaRes = await gh.getFile("public/content/images/metadata.json");
      if (imageMetaRes?.content) imageMetadata = JSON.parse(imageMetaRes.content);
    } catch {}

    let lastCommitMsg = "Upload";
    let touchedFiles = false;
    let touchedImages = false;

    for (const item of items) {
      let result: ReturnType;

      if (item.type === "blog") {
        result = await blog(item);
      } else if (item.type === "file") {
        result = await file(item, fileMetadata);
        fileMetadata = result.metadata as FileMetadata[];
        touchedFiles = true;
      } else if (item.type === "image") {
        result = await image(item, imageMetadata);
        imageMetadata = result.metadata as CollectionMetadata[];
        touchedImages = true;
      } else {
        throw new Error(`Unknown item type: ${item.type}`);
      }

      lastCommitMsg = result.commitMsg ?? lastCommitMsg;
      filesToUpload.push(result.file);
    }

    // Append metadata once if needed
    if (touchedFiles) {
      filesToUpload.push({
        remotePath: "public/content/files/metadata.json",
        content: JSON.stringify(fileMetadata, null, 2),
      });
    }
    if (touchedImages) {
      filesToUpload.push({
        remotePath: "public/content/images/metadata.json",
        content: JSON.stringify(imageMetadata, null, 2),
      });
    }

    // Decide commit message
    const commitMsg =
      filesToUpload.length <= 2 ? lastCommitMsg : "Batch upload";

    const res = await gh.upload(filesToUpload, commitMsg);
    if (!res.ok) throw new Error("Failed to upload files to GitHub");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    });
  }
}
