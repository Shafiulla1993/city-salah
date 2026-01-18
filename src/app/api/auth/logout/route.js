// src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import { authCookie } from "@/lib/auth/cookies";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(authCookie.name, "", {
    ...authCookie.options,
    maxAge: 0,
  });

  return response;
}
