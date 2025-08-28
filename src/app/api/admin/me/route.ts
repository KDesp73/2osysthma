import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
    const cookie = req.headers.get("cookie") ?? "";
    const token = cookie.split("; ").find((c) => c.startsWith("authToken="))?.split("=")[1];

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
        return NextResponse.json({ user: decoded });
    } catch {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
