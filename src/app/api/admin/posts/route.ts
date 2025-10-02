import { GithubHelper } from "@/lib/GithubHelper";
import { createSlug } from "@/lib/posts";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;
    const slug = createSlug(title);

    const gh = await GithubHelper.create();

    let res;
    try {
      res = await gh.remove(
        [`public/content/blog/${slug}.md`],
        `Removed blog post: ${title}`,
      );
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : JSON.stringify(err));
      throw new Error(err instanceof Error ? err.message : JSON.stringify(err));
    }

    if (res.status != 200) throw new Error("Failed removing blog post");

    return NextResponse.json({ success: true, ...res });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
