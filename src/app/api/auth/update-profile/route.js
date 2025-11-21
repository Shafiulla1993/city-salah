// src/app/api/auth/update-profile/route.js

import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { verifyToken } from "@/server/utils/createTokens";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
  await connectDB();

  const token = req.cookies.get("accessToken")?.value;
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, city, area, password } = await req.json();

  const updateData = {
    name,
    phone,
    city,
    area,
  };

  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(decoded.userId, updateData, {
    new: true,
  }).select("-password");

  return NextResponse.json({ user });
}
