// src/app/api/auth/send-verification/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendMail } from "@/lib/mail/mailer";
import { verifyEmailTemplate } from "@/lib/mail/templates/verifyEmail";

export async function POST(request) {
  await connectDB();

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 400 }
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.emailVerifyToken = hashedToken;
    user.emailVerifyExpire = Date.now() + 1000 * 60 * 60 * 24;
    await user.save();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const verifyLink = `${baseUrl}/auth/verify-email?token=${rawToken}`;
    console.log("VERIFY LINK =", verifyLink);


    await sendMail({
      to: user.email,
      subject: "Verify your CitySalah email",
      html: verifyEmailTemplate({
        name: user.name,
        link: verifyLink,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (err) {
    console.error("SEND_VERIFY_ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
