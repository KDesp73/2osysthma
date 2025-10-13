import { NextResponse } from "next/server";
import matter from "gray-matter";
import { ContentType, GithubHelper } from "@/lib/GithubHelper";
import {
  CollectionMetadata,
  FileMetadata,
  ImageMetadata,
} from "@/lib/metadata";
import { slugify } from "@/lib/utils";

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
  path?: string;
}

// --- BLOG ---
async function blog(item: UploadItem) {
  if (!item.title || !item.content)
    throw new Error("Blog items must have title and content");

  const slug = slugify(item.title);
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
      remotePath: item.path ? item.path : `public/content/blog/${slug}.md`,
      content: frontmatter,
      encoding: "utf-8",
    },
  } as ReturnType;
}

// --- FILE ---
async function file(item: UploadItem, existingMetadata: FileMetadata[] = []) {
  if (!item.name || !item.data)
    throw new Error("File items must have name and data");

  const metadata: FileMetadata[] = [...existingMetadata];

  const entry: FileMetadata = {
    filename: item.name,
    title: item.title || item.name,
    description: item.description || "",
  };

  const idx = metadata.findIndex((m) => m.filename === item.name);
  if (idx >= 0) metadata[idx] = entry;
  else metadata.push(entry);

  return {
    commitMsg: `Uploaded file '${item.name}'`,
    file: {
      remotePath: item.path ? item.path : `public/content/files/${item.name}`,
      content: item.data,
      encoding: "base64",
    },
    metadata,
  } as ReturnType;
}

// --- IMAGE ---
async function image(
  item: UploadItem,
  existingMetadata: CollectionMetadata[] = [],
) {
  if (!item.name || !item.data)
    throw new Error("Image items must have name and data");

  const metadata: CollectionMetadata[] = [...existingMetadata];

  // --- CASE 1: Custom path mode (manual upload, no metadata tracking) ---
  if (item.path) {
    // Normalize path (ensure it starts with "public/")
    const remotePath = item.path.startsWith("public/")
      ? item.path
      : `public/${item.path.replace(/^\/+/, "")}`;

    return {
      commitMsg: `Uploaded image '${item.name}'`,
      file: {
        remotePath,
        content: item.data,
        encoding: "base64",
      },
      metadata, // unchanged (we don’t track metadata outside content/images)
    } as ReturnType;
  }

  // --- CASE 2: Collection-based mode (standard CMS behavior) ---
  if (!item.collection)
    throw new Error("Image items must have either a collection or a path");

  // Find or create collection metadata
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

  // Build the default public and remote paths
  const publicPath = `/content/images/${item.collection}/${item.name}`;
  const remotePath = `public${publicPath}`;

  collection.images.push({
    path: publicPath,
    index: nextIndex,
  });

  return {
    commitMsg: `Uploaded image '${item.name}'`,
    file: {
      remotePath,
      content: item.data,
      encoding: "base64",
    },
    metadata,
  } as ReturnType;
}

interface FileType {
  remotePath: string;
  content: ContentType;
  encoding: "utf-8" | "base64";
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

    const gh = await GithubHelper.create();

    const filesToUpload: FileType[] = [];

    // Load existing metadata once
    let fileMetadata: FileMetadata[] = [];
    let imageMetadata: CollectionMetadata[] = [];

    try {
      const fileMetaRes = await gh.getFile(
        "public/content/files/metadata.json",
      );
      if (fileMetaRes?.content) fileMetadata = JSON.parse(fileMetaRes.content);
    } catch {}

    try {
      const imageMetaRes = await gh.getFile(
        "public/content/images/metadata.json",
      );
      if (imageMetaRes?.content)
        imageMetadata = JSON.parse(imageMetaRes.content);
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
        encoding: "utf-8",
      });
    }
    if (touchedImages) {
      filesToUpload.push({
        remotePath: "public/content/images/metadata.json",
        content: JSON.stringify(imageMetadata, null, 2),
        encoding: "utf-8",
      });
    }

    // Decide commit message
    const commitMsg =
      filesToUpload.length <= 2 ? lastCommitMsg : "Batch upload";

    const res = await gh.upload(filesToUpload, commitMsg);
    if (res.status != 200) throw new Error("Failed to upload files to GitHub");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    });
  }
}
