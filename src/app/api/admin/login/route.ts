// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_USER = process.env.ADMIN_USER!;
const ADMIN_PASS = process.env.ADMIN_PASS!;
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "adminToken",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 3600, // 1 hour
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}
