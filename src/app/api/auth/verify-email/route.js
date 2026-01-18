// src/app/api/auth/verify-email/route.js

import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { createToken } from "@/lib/auth/token";
import { authCookie } from "@/lib/auth/cookies";

export async function GET(request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_token", baseUrl)
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpire: { $gt: Date.now() },
    });

    // Token invalid or expired
    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/login?error=expired_token", baseUrl)
      );
    }

    // Mark verified
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    // Auto login
    const jwtToken = createToken(user);

    const res = NextResponse.redirect(new URL("/", baseUrl));
    res.cookies.set(authCookie.name, jwtToken, authCookie.options);

    return res;
  } catch (err) {
    console.error("VERIFY_EMAIL_ERROR:", err);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    return NextResponse.redirect(
      new URL("/auth/login?error=server", baseUrl)
    );
  }
}
