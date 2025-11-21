// src/app/api/public/cities/[cityId]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { cityId } = await params;

    // Optional: fetch full city if needed
    const city = await City.findById(cityId);
    if (!city) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    // Return **areas belonging to this city**
    const areas = await Area.find({ city: cityId }).select("name slug center");

    return NextResponse.json({
      city,
      areas,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
