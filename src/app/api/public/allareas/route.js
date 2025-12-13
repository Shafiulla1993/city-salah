// src/app/api/public/allareas/route.js

import { NextResponse } from "next/server";
import Area from "@/models/Area";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const areas = await Area.find()
      .select("name")
      .populate("city", "name")
      .lean();
    const formattedAreas = areas.map((a) => ({
      _id: a._id,
      name: a.name,
      city: a.city?.name || null, // flatten city name
    }));

    return NextResponse.json(formattedAreas, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
