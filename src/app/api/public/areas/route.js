// src/app/api/public/areas/route.js

import { NextResponse } from "next/server";
import Area from "@/models/Area";
import connectDB from "@/lib/db";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");

    if (!cityId) {
      return NextResponse.json(
        { message: "City ID is required" },
        { status: 400 }
      );
    }

    const areas = await Area.find({ city: cityId })
      .select("_id name slug city")
      .populate("city", "name slug")
      .lean();

    const formatted = areas.map((a) => ({
      _id: a._id.toString(),
      name: a.name,
      slug: a.slug,
      cityId: a.city?._id?.toString(),
      cityName: a.city?.name || "",
      citySlug: a.city?.slug || "",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
