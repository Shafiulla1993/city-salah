// src/app/api/auth/me/route.js
import { verifyToken } from "@/server/utils/createTokens";
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.json({ loggedIn: false });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ loggedIn: false });

  const user = await User.findById(decoded.userId)
    .select("-password")
    .populate("city", "name")
    .populate("area", "name")
    .lean();

  return NextResponse.json({
    loggedIn: true,
    user,
  });
}
