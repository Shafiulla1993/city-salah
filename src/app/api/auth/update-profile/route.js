// src/app/api/auth/update-profile/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import City from "@/models/City";
import Area from "@/models/Area";
import { verifyToken } from "@/server/utils/createTokens";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function PATCH(req) {
  await connectDB();

  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, phone, email, city, area, password } = body;

    // load user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Validate unique phone if provided and changed
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: "Phone already in use" },
          { status: 400 }
        );
      }
      user.phone = phone;
    }

    // Validate unique email if provided and changed
    if (email !== undefined && email !== (user.email || "")) {
      if (email) {
        const existingEmail = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: userId },
        });
        if (existingEmail) {
          return NextResponse.json(
            { success: false, message: "Email already in use" },
            { status: 400 }
          );
        }
        user.email = email.toLowerCase();
      } else {
        // if empty string explicitly sent, remove email (optional — change if you don't want this)
        user.email = undefined;
      }
    }

    // Update name if provided
    if (name !== undefined) user.name = name;

    // Resolve city (accept id or name)
    if (city !== undefined && city !== "") {
      let cityId = city;
      if (!mongoose.isValidObjectId(city)) {
        const found = await City.findOne({
          name: { $regex: `^${city}$`, $options: "i" },
        });
        if (!found) {
          return NextResponse.json(
            { success: false, message: `City not found: ${city}` },
            { status: 404 }
          );
        }
        cityId = found._id;
      }
      user.city = cityId;
    } else if (city === "") {
      // if explicitly empty, unset (optional)
      user.city = undefined;
    }

    // Resolve area (accept id or name). If area provided without city, search globally.
    if (area !== undefined && area !== "") {
      let areaId = area;
      if (!mongoose.isValidObjectId(area)) {
        const query = { name: { $regex: `^${area}$`, $options: "i" } };
        if (user.city) query.city = user.city;
        const foundArea = await Area.findOne(query);
        if (!foundArea) {
          return NextResponse.json(
            { success: false, message: `Area not found: ${area}` },
            { status: 404 }
          );
        }
        areaId = foundArea._id;
      }
      user.area = areaId;
    } else if (area === "") {
      user.area = undefined;
    }

    // Password hashing if provided
    if (password && password.trim() !== "") {
      const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      user.password = hashed;
    }

    // Save user
    await user.save();

    // Return populated user without password
    const saved = await User.findById(user._id)
      .select("-password")
      .populate("city", "name")
      .populate("area", "name")
      .lean();

    return NextResponse.json(
      { success: true, message: "Profile updated", user: saved },
      { status: 200 }
    );
  } catch (err) {
    console.error("update-profile error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
