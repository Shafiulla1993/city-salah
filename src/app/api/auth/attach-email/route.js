// src/app/api/auth/attach-email/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendMail } from "@/lib/mail/mailer";
import { verifyEmailTemplate } from "@/lib/mail/templates/verifyEmail";

export async function POST(req) {
  await connectDB();

  try {
    const { phone, email } = await req.json();

    if (!phone || !email) {
      return NextResponse.json(
        { message: "Phone and email required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    user.email = email.toLowerCase();
    user.emailVerified = false;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.emailVerifyToken = hashed;
    user.emailVerifyExpire = Date.now() + 1000 * 60 * 60 * 24;
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const link = `${baseUrl}/auth/verify-email?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Verify your CitySalah email",
      html: verifyEmailTemplate({ name: user.name, link }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ATTACH_EMAIL_ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
