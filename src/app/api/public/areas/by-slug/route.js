// src/app/api/public/areas/by-slug/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("citySlug");
  const areaSlug = searchParams.get("areaSlug");

  if (!citySlug || !areaSlug) {
    return NextResponse.json(
      { message: "citySlug and areaSlug are required" },
      { status: 400 },
    );
  }

  const city = await City.findOne({ slug: citySlug })
    .select("name slug")
    .lean();
  if (!city) {
    return NextResponse.json({ message: "City not found" }, { status: 404 });
  }

  const area = await Area.findOne({
    slug: areaSlug,
    city: city._id,
  })
    .select("name slug center")
    .lean();

  if (!area) {
    return NextResponse.json({ message: "Area not found" }, { status: 404 });
  }

  return NextResponse.json({
    city: {
      name: city.name,
      slug: city.slug,
    },
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
