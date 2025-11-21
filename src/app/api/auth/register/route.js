import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { registerUser } from "@/server/controllers/authController";

export async function POST(request) {
  await connectDB();

  const body = await request.json();
  const result = await registerUser(body);

  const res = NextResponse.json(result.json, { status: result.status });

  if (result.cookies) {
    res.cookies.set("accessToken", result.cookies.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });

    res.cookies.set("refreshToken", result.cookies.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}
