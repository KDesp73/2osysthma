import { NextResponse } from "next/server";
import { GithubHelper } from "@/lib/GithubHelper";

interface FileUpload {
    name: string;          // original file name
    title?: string;        // user-defined title
    description?: string;  // user-defined description
    data: Uint8Array;      // file content in bytes
}

interface Metadata {
    filename: string;
    title: string;
    description: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const files: FileUpload[] = body.files;

        const gh = new GithubHelper("KDesp73", "2osysthma");
        const metadataPath = "public/content/files/metadata.json";

        // 1️⃣ Fetch the latest metadata.json from GitHub
        let currentMetadata: Metadata[] = [];
        try {
            const res = await gh.getFile(metadataPath);
            if (res && res.content) {
                currentMetadata = JSON.parse(res.content);
            }
        } catch (err) {
            console.log("No existing metadata.json, creating new one.");
        }

        // 2️⃣ Upload files and append to metadata
        for (const file of files) {
            const res = await gh.uploadFile(
                `public/content/files/${file.name}`,
                `Uploaded file: ${file.name}`,
                file.data
            );
            if (!res.ok) {
                console.error(await res.text?.());
                throw new Error(`Failed to upload ${file.name}`);
            }

            // Add or update entry in metadata
            const existingIndex = currentMetadata.findIndex(
                (m) => m.filename === file.name
            );
            const metadataEntry: Metadata = {
                filename: file.name,
                title: file.title || file.name,
                description: file.description || "",
            };

            if (existingIndex >= 0) {
                currentMetadata[existingIndex] = metadataEntry;
            } else {
                currentMetadata.push(metadataEntry);
            }
        }

        // 3️⃣ Upload updated metadata.json
        await gh.uploadFile(
            metadataPath,
            "Update metadata.json",
            Buffer.from(JSON.stringify(currentMetadata, null, 2))
        );

        return NextResponse.json({ success: true, metadata: currentMetadata });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            error: (err as Error).message,
        });
    }
}
