// src/app/api/public/areas/nearest/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Area from "@/models/Area";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));

  const area = await Area.findOne({
    center: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: 30000,
      },
    },
  })
    .populate("city", "name slug")
    .lean();

  if (!area) {
    return NextResponse.json({ message: "No nearby area" }, { status: 404 });
  }

  return NextResponse.json({
    city: { name: area.city.name, slug: area.city.slug },
    area: {
      name: area.name,
      slug: area.slug,
      center: {
        lat: area.center.coordinates[1],
        lng: area.center.coordinates[0],
      },
    },
  });
}
