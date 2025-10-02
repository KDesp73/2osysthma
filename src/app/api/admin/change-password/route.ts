import { NextResponse } from "next/server";
import { verifyPassword, hashPassword } from "@/lib/auth"; // bcrypt helpers
import { turso } from "@/lib/turso"; // your Turso client
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { oldPassword, newPassword } = await req.json();

    const cookieStore = cookies();
    const token = (await cookieStore).get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    let username: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        username: string;
      };
      username = decoded.username;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    // Fetch user record from DB
    const dbUser = await turso.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username],
    });

    if (dbUser.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const hashedPassword = dbUser.rows[0].password as string;

    // Verify old password
    const valid = await verifyPassword(oldPassword, hashedPassword);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Old password incorrect" },
        { status: 400 },
      );
    }

    // Hash new password
    const newHashed = await hashPassword(newPassword);

    // Update DB
    await turso.execute({
      sql: "UPDATE users SET password = ? WHERE username = ?",
      args: [newHashed, username],
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 },
    );
  }
}
