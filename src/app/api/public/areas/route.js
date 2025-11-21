// src/app/api/public/areas/[areaId]/route.js

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

    const areas = await Area.find({ city: cityId }).select("name");
    return NextResponse.json(areas);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
