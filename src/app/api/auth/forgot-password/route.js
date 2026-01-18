// src/app/api/auth/forgot-password/route.js

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendMail } from "@/lib/mail/mailer";

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal whether user exists
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your CitySalah password",
      html: `
        <p>Assalamu Alaikum ${user.name},</p>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetLink}">Click here to reset your password</a>
        </p>
        <p>This link will expire in 30 minutes.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("FORGOT_PASSWORD_ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
