import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASS!,
            },
        });

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.RECIPIENT_EMAIL!,
            subject: `Νέο μήνυμα απο την σελίδα (${name})`,
            text: message,
            html: `<p>${message}</p><p>From: ${name} (${email})</p>`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email error:", error);
        return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
    }
}
