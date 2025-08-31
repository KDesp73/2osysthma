import { GithubHelper } from "@/lib/GithubHelper";
import { createSlug } from "@/lib/posts";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { title } = body;
        const slug = createSlug(title);

        const gh = new GithubHelper("KDesp73", "2osysthma");

        const res = await gh.removeFile(
            `public/content/blog/${slug}.md`,
            `Removed blog post: ${title}`
        );

        if(!res.ok) throw new Error("Failed removing blog post");

        return NextResponse.json({ success: true, ...res });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}


