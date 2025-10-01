import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashed);
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAdmin(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("authToken="))
    ?.split("=")[1];

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ user: null }, { status: 401 }),
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      username: string;
      role: string;
    };
    if (decoded.role !== "admin") {
      return {
        user: null,
        error: NextResponse.json({ user: null }, { status: 403 }),
      };
    }
    return { user: decoded, error: null };
  } catch {
    return {
      user: null,
      error: NextResponse.json({ user: null }, { status: 401 }),
    };
  }
}
