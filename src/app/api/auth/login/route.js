// src/app/api/auth/login
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { loginUser } from "@/server/controllers/authController";

export async function POST(req) {
  await connectDB();

  const { phone, password } = await req.json();
  const loginResult = await loginUser({ phone, password });

  // 🔥 FAILED LOGIN → CLEAR OLD TOKENS
  if (!loginResult?.json?.user) {
    const res = NextResponse.json(
      { message: loginResult?.json?.message || "Invalid credentials" },
      { status: loginResult?.status || 401 }
    );

    // delete old cookies
    res.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
    res.cookies.set("refreshToken", "", {
      path: "/api/auth/refresh",
      maxAge: 0,
    });

    return res;
  }

  // SUCCESS
  const res = NextResponse.json(loginResult.json);

  if (loginResult.cookies?.accessToken) {
    res.cookies.set("accessToken", loginResult.cookies.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
  }

  if (loginResult.cookies?.refreshToken) {
    res.cookies.set("refreshToken", loginResult.cookies.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}
