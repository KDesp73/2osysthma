import { NextResponse } from "next/server";
import { GithubHelper } from "@/lib/GithubHelper";

interface FileUpload {
  name: string;
  title?: string;
  description?: string;
  data: Uint8Array;
}

interface Metadata {
    filename: string,
    title: string,
    description: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const files: FileUpload[] = body.files;

    const gh = new GithubHelper("KDesp73", "2osysthma");
    const metadataPath = "public/content/files/metadata.json";

    // 1️⃣ Fetch current metadata.json
    let currentMetadata: Metadata[] = [];
    try {
      const metadataRes = await fetch(
        `https://raw.githubusercontent.com/KDesp73/2osysthma/main/${metadataPath}`
      );
      if (metadataRes.ok) {
        currentMetadata = await metadataRes.json();
      }
    } catch (err) {
      console.log("No existing metadata.json, creating new one.");
    }

    // 2️⃣ Upload files and update metadata array
    for (const file of files) {
      const res = await gh.uploadFile(
        `public/content/files/${file.name}`,
        `Uploaded file: ${file.name}`,
        file.data
      );
      if (!res.ok) {
        console.log(res.statusText);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Add entry to metadata
      currentMetadata.push({
        filename: file.name,
        title: file.title || file.name,
        description: file.description || "",
      });
    }

    // 3️⃣ Upload updated metadata.json
    await gh.uploadFile(
      metadataPath,
      "Update metadata.json",
      Buffer.from(JSON.stringify(currentMetadata, null, 2))
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
