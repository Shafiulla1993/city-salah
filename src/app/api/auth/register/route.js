// src/app/api/auth/reisgter/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { registerUser } from "@/server/controllers/authController";
import { accessTokenCookie, refreshTokenCookie } from "@/lib/auth/cookies";

export async function POST(request) {
  await connectDB();

  const body = await request.json();
  const result = await registerUser(body);

  const res = NextResponse.json(result.json, { status: result.status });

  if (result.cookies) {
    res.cookies.set(
      accessTokenCookie.name,
      result.cookies.accessToken,
      accessTokenCookie.options
    );

    res.cookies.set(
      refreshTokenCookie.name,
      result.cookies.refreshToken,
      refreshTokenCookie.options
    );
  }

  return res;
}
