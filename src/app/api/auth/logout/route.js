// src/app/api/auth/logout/route.js

import { accessTokenCookie, refreshTokenCookie } from "@/lib/auth/cookies";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(accessTokenCookie.name, "", {
    ...accessTokenCookie.options,
    maxAge: 0,
  });

  response.cookies.set(refreshTokenCookie.name, "", {
    ...refreshTokenCookie.options,
    maxAge: 0,
  });
  return response;
}
