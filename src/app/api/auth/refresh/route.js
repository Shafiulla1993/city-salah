// src/app/api/auth/refresh/aoute.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  createAccessToken,
  verifyRefreshToken,
} from "@/server/utils/createTokens";
import { accessTokenCookie } from "@/lib/auth/cookies";

export async function POST(request) {
  await connectDB();

  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return NextResponse.json({ message: "Expired token" }, { status: 403 });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return NextResponse.json({ message: "Invalid user" }, { status: 401 });
  }

  const accessToken = createAccessToken(user);

  // ✅ MUST be NextResponse
  const response = NextResponse.json({ accessToken }, { status: 200 });

  // ✅ cookies API exists ONLY on NextResponse
  response.cookies.set(
    accessTokenCookie.name,
    accessToken,
    accessTokenCookie.options
  );

  return response;
}
