import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";

let cache = {
  data: null,
  expires: 0,
};

/**
 * GET /api/public/masjids/index
 * Optional:
 *   ?city=<cityId>
 */
export async function GET(req) {
  try {
    const now = Date.now();

    // -----------------------------
    // Cache (10 minutes)
    // -----------------------------
    if (cache.data && cache.expires > now) {
      return NextResponse.json(cache.data, { status: 200 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("city");

    const filter = {};
    if (cityId) filter.city = cityId;

    // -----------------------------
    // Lightweight index query
    // -----------------------------
    const masjids = await Masjid.find({})
  .populate("city", "name")
  .populate("area", "name")
  .lean();

const formatted = masjids.map((m) => ({
  slug: m.slug,
  name: m.name,

  areaId: m.area?._id?.toString() || null,
  areaName: m.area?.name || "",

  cityId: m.city?._id?.toString() || null,
  cityName: m.city?.name || "",
}));


    cache = {
      data: formatted,
      expires: now + 10 * 60 * 1000,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("Masjid index error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load masjid index" },
      { status: 500 }
    );
  }
}

