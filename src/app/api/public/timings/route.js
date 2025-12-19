// src/app/api/public/timings/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { resolvePrayerTimings } from "@/server/services/prayerResolver";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const masjidId = searchParams.get("masjidId");

    if (!masjidId || !mongoose.isValidObjectId(masjidId)) {
      return NextResponse.json(
        { success: false, message: "Invalid masjidId" },
        { status: 400 }
      );
    }

    const config = await MasjidPrayerConfig.findOne({
      masjid: masjidId,
    }).lean();

    if (!config) {
      return NextResponse.json({
        success: true,
        data: {},
      });
    }

    const timings = resolvePrayerTimings({ config });

    return NextResponse.json({
      success: true,
      data: timings,
    });
  } catch (err) {
    console.error("Public timings error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load prayer timings" },
      { status: 500 }
    );
  }
}
