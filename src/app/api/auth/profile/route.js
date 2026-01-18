// src/app/api/auth/profile/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import City from "@/models/City";
import Area from "@/models/Area";
import mongoose from "mongoose";
import { protect } from "@/lib/auth/protect";

export async function PATCH(request) {
  await connectDB();

  try {
    // 🔐 Auth
    const auth = await protect(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = auth.user._id;

    const { name, phone, city, area } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🧑 Name
    if (name !== undefined) {
      user.name = name.trim();
    }

    // 📞 Phone (unique)
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone, _id: { $ne: userId } });
      if (exists) {
        return NextResponse.json(
          { success: false, message: "Phone already in use" },
          { status: 400 }
        );
      }
      user.phone = phone;
    }

    // 🏙 City
    if (city) {
      const cityDoc = mongoose.isValidObjectId(city)
        ? await City.findById(city)
        : await City.findOne({ name: new RegExp(`^${city}$`, "i") });

      if (!cityDoc) {
        return NextResponse.json(
          { success: false, message: `City not found: ${city}` },
          { status: 404 }
        );
      }
      user.city = cityDoc._id;
    }

    // 📍 Area
    if (area) {
      const query = mongoose.isValidObjectId(area)
        ? { _id: area }
        : { name: new RegExp(`^${area}$`, "i"), city: user.city };

      const areaDoc = await Area.findOne(query);
      if (!areaDoc) {
        return NextResponse.json(
          { success: false, message: `Area not found: ${area}` },
          { status: 404 }
        );
      }
      user.area = areaDoc._id;
    }

    await user.save();

    const updated = await User.findById(userId)
      .select("-password")
      .populate("city", "name")
      .populate("area", "name")
      .lean();

    return NextResponse.json(
      { success: true, message: "Profile updated", user: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("profile update error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
