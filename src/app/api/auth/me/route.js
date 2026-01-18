// src/app/api/auth/me/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { protect } from "@/lib/auth/protect";

export async function GET(request) {
  await connectDB();

  const auth = await protect(request);

  if (auth.error) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const user = await User.findById(auth.user._id)
    .select("-password")
    .populate("city", "name")
    .populate("area", "name")
    .lean();

  if (!user) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const response = NextResponse.json({
    loggedIn: true,
    user,
  });

  // Sliding session cookie already refreshed in protect()
  return response;
}
