import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const areaId = searchParams.get("areaId");
    const search = searchParams.get("search");

    const filter = {};
    if (cityId) filter.city = cityId;
    if (areaId) filter.area = areaId;
    if (search) filter.name = { $regex: search, $options: "i" };

    const masjids = await Masjid.find(filter)
      .populate("city", "name timezone")
      .populate("area", "name")
      .select("name slug imageUrl contacts location prayerTimings");

    return NextResponse.json(masjids);
  } catch (err) {
    console.error("Error fetching masjids:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
