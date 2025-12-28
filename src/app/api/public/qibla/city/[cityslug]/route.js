// src/app/api/public/qibla/city/[citySlug]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { citySlug } = await params;

    // 1️⃣ Find city by slug
    const city = await City.findOne({ slug: citySlug })
      .select("name slug")
      .lean();

    if (!city) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    // 2️⃣ Fetch areas with coordinates
    const areas = await Area.find({
      city: city._id,
      "center.coordinates": { $exists: true },
    })
      .select("center")
      .lean();

    if (!areas.length) {
      return NextResponse.json(
        { message: "No areas with coordinates found" },
        { status: 404 }
      );
    }

    // 3️⃣ Average coordinates (BEST strategy)
    let latSum = 0;
    let lngSum = 0;

    for (const a of areas) {
      lngSum += a.center.coordinates[0];
      latSum += a.center.coordinates[1];
    }

    return NextResponse.json({
      city,
      center: {
        lat: latSum / areas.length,
        lng: lngSum / areas.length,
      },
      areasCount: areas.length,
    });
  } catch (err) {
    console.error("Qibla city API error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
