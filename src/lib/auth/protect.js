// src/server/middleware/protect.js

import { verifyAccessToken } from "@/server/utils/createTokens";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function protect(request) {
  await connectDB();

  let token;

  // 1️⃣ Mobile App → Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ Web → HttpOnly cookie
  if (!token) {
    token = request.cookies.get("accessToken")?.value;
  }

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return { error: "Token expired", status: 401 };
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return { error: "Invalid user", status: 401 };

    return { user };
  } catch {
    return { error: "Token expired", status: 401 };
  }
}
