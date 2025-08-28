import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { hashPassword } from "@/lib/auth";

export async function GET() {
    const result = await turso.execute("SELECT id, username FROM users");
    return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const hashedPass = await hashPassword(password);

        if (!username || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        await turso.execute({
            sql: "INSERT INTO users (username, password) VALUES (?, ?)",
            args: [username, hashedPass],
        });

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        console.log(id);
        if (id == null) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await turso.execute({
            sql: "DELETE FROM users WHERE id = ?",
            args: [id],
        });

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

