import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api/admin")) {
        const token = req.cookies.get("authToken")?.value;
        if (!token) return NextResponse.json({ user: null }, { status: 401 });

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
            if (decoded.role !== "admin") return NextResponse.json({ user: null }, { status: 403 });
            return NextResponse.next();
        } catch {
            return NextResponse.json({ user: null }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/admin/:path*"],
};

