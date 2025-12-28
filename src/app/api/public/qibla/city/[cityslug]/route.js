// src/app/api/public/qibla/city/[cityslug]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { cityslug } = params;

    const city = await City.findOne({
      slug: new RegExp(`^${cityslug}$`, "i"),
    }).select("_id name slug");

    if (!city) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    const areas = await Area.find({
      city: city._id,
      "center.coordinates.0": { $exists: true },
    })
      .select("center")
      .lean();

    if (!areas.length) {
      return NextResponse.json(
        { message: "No area coordinates available" },
        { status: 404 }
      );
    }

    // GeoJSON average
    const avgLat =
      areas.reduce((s, a) => s + a.center.coordinates[1], 0) / areas.length;

    const avgLng =
      areas.reduce((s, a) => s + a.center.coordinates[0], 0) / areas.length;

    return NextResponse.json({
      city: {
        name: city.name,
        slug: city.slug,
      },
      center: {
        lat: avgLat,
        lng: avgLng,
      },
      areasCount: areas.length,
    });
  } catch (err) {
    console.error("City Qibla API error:", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
