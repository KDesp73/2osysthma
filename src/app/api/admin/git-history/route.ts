import { GithubHelper } from "@/lib/GithubHelper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const path = url.searchParams.get("path") || "";
    const count = parseInt(url.searchParams.get("count") || "10", 10);

    const gh = await GithubHelper.create();

    const commits = await gh.getHistory(path, count);

    return NextResponse.json(commits);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
