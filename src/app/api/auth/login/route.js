// src/app/api/auth/login

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth/token";
import { authCookie } from "@/lib/auth/cookies";

export async function POST(req) {
  await connectDB();

  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Phone or Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [
        { phone: identifier },
        { email: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔵 Legacy user: no email yet
    if (!user.email) {
      return NextResponse.json(
        { code: "EMAIL_REQUIRED" },
        { status: 403 }
      );
    }

    // 🟡 Email exists but not verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          code: "EMAIL_NOT_VERIFIED",
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = createToken(user);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });

    res.cookies.set(authCookie.name, token, authCookie.options);

    return res;
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
