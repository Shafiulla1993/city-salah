// src/lib/auth/protect.js

import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken, createToken } from "./token";
import { authCookie } from "./cookies";
import { NextResponse } from "next/server";

export async function protect(request) {
  await connectDB();

  let token;

  // Mobile support (future)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Web support
  if (!token) {
    token = request.cookies.get(authCookie.name)?.value;
  }

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: "Session expired", status: 401 };
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    return { error: "Invalid user", status: 401 };
  }

  // 🔁 Sliding session: refresh token on activity
  const newToken = createToken(user);

  const response = NextResponse.next();
  response.cookies.set(authCookie.name, newToken, authCookie.options);

  return { user, response };
}
