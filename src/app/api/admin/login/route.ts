// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { turso } from "@/lib/turso";
import { verifyPassword } from "@/lib/auth";

const ADMIN_USER = process.env.ADMIN_USER!;
const ADMIN_PASS = process.env.ADMIN_PASS!;
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    const { username, password } = await req.json();

    // ---- ADMIN LOGIN ----
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

        const response = NextResponse.json({ success: true, role: "admin" });
        response.cookies.set({
            name: "authToken",
            value: token,
            httpOnly: true,
            path: "/",
            maxAge: 3600,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    }

    // ---- REGULAR USER LOGIN ----
    try {
        const result = await turso.execute({
            sql: "SELECT username, password FROM users WHERE username = ?",
            args: [username],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }

        const user = result.rows[0];
        const hashedPass = user.password?.toString() as string;
        const validPass = await verifyPassword(password, hashedPass);
        if (!validPass) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign({ username, role: "user" }, JWT_SECRET, { expiresIn: "1h" });

        const response = NextResponse.json({ success: true, role: "user" });
        response.cookies.set({
            name: "authToken",
            value: token,
            httpOnly: true,
            path: "/",
            maxAge: 3600,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    } catch (err) {
        console.error("DB error:", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
