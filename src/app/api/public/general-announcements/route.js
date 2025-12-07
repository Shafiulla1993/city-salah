// src/app/api/public/general-announcements

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";
import Masjid from "@/models/Masjid";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const masjidId = searchParams.get("masjidId");
    const areaId = searchParams.get("areaId");
    const cityId = searchParams.get("cityId");

    const now = new Date();

    let filter = {
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    // 🔥 Priority 1 — MASJID
    if (masjidId) {
      const masjid = await Masjid.findById(masjidId).select("area city");
      filter.$or = [
        { masjids: masjidId }, // tagged to masjid
        { areas: masjid?.area }, // tagged to area
        { cities: masjid?.city }, // tagged to city
        { masjids: { $size: 0 }, areas: { $size: 0 }, cities: { $size: 0 } }, // global
      ];
    }

    // 🔥 Priority 2 — AREA
    else if (areaId) {
      filter.$or = [
        { areas: areaId },
        { cities: cityId },
        { masjids: { $size: 0 }, areas: { $size: 0 }, cities: { $size: 0 } },
      ];
    }

    // 🔥 Priority 3 — CITY
    else if (cityId) {
      filter.$or = [
        { cities: cityId },
        { masjids: { $size: 0 }, areas: { $size: 0 }, cities: { $size: 0 } },
      ];
    }

    const data = await GeneralAnnouncement.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Public announcement error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
