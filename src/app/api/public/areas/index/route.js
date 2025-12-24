// src/app/api/public/areas/index/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Area from "@/models/Area";

export async function GET() {
  try {
    await connectDB();

    const areas = await Area.find()
      .select("name slug city")
      .populate("city", "slug name")
      .lean();

    const formatted = areas.map((a) => ({
      _id: a._id.toString(),
      name: a.name,
      slug: a.slug,
      citySlug: a.city?.slug || "",
      cityName: a.city?.name || "",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("areas-index error:", err);
    return NextResponse.json([], { status: 200 }); // ✅ sitemap-safe
  }
}
