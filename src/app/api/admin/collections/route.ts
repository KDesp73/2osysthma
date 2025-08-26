import { readdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const imagesPath = path.join(process.cwd(), "public/content/images");
    const folders = await readdir(imagesPath, { withFileTypes: true });

    const collections = folders
      .filter((f) => f.isDirectory())
      .map((f) => f.name);

    return NextResponse.json({ collections });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ collections: [] });
  }
}

