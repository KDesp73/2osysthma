import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET() {
  const filesDir = path.join(process.cwd(), "public/content/files");
  const metadataPath = path.join(filesDir, "metadata.json");

  let metadata: { filename: string; title: string; description: string }[] = [];
  try {
    const raw = await fs.readFile(metadataPath, "utf-8");
    metadata = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read metadata.json", err);
  }

  const files = metadata.map((file) => ({
    name: file.title,
    description: file.description,
    href: `/content/files/${file.filename}`,
  }));

  return NextResponse.json({ files });
}
