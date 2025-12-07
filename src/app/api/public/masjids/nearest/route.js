// src/app/api/public/masjids/nearest/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const limit = Number(searchParams.get("limit") || 5);

    if (!lat || !lng)
      return NextResponse.json(
        { message: "Latitude and longitude are required" },
        { status: 400 }
      );

    const masjids = await Masjid.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000,
        },
      },
    })
      .limit(limit)
      .populate("city area", "name")
      .select("name imageUrl contacts location prayerTimings");

    return NextResponse.json(masjids);
  } catch (err) {
    console.error("Nearest masjids error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
