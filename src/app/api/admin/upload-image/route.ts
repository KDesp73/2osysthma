import { NextResponse } from "next/server";
import { GithubHelper } from "@/lib/GithubHelper";

interface ImageUpload {
    name: string;
    data: Uint8Array;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const images: ImageUpload[] = body.images;

        const gh = new GithubHelper("KDesp73", "2osysthma");

        for (const image of images) {
            const res = await gh.uploadImage(
                `public/content/images/${image.name}`,
                `Uploaded image: ${image.name}`,
                image.data
            );
            if(!res.ok) {
                console.log(res.statusText);
                throw new Error(`Failed to upload ${image.name}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: (err as Error).message });
    }
}
