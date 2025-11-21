// src/app/api/public/areas/[areaId]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { areaId } = params;

    // Fetch area
    const area = await Area.findById(areaId)
      .populate("city", "name slug") // optional
      .select("name slug center city");

    if (!area) {
      return NextResponse.json({ message: "Area not found" }, { status: 404 });
    }

    // Fetch all masjids inside this area
    const masjids = await Masjid.find({ area: areaId }).select(
      "name slug address center images"
    );

    return NextResponse.json({
      area,
      masjids,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
