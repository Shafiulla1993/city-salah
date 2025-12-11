// src/app/api/public/masjids/index/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";

let cache = {
  data: null,
  expires: 0,
};

export async function GET() {
  try {
    // Serve from cache if fresh
    const now = Date.now();
    if (cache.data && cache.expires > now) {
      return NextResponse.json(cache.data, { status: 200 });
    }

    await connectDB();

    // Fetch minimal fields only
    const masjids = await Masjid.find({}).select("name area city").lean();

    const formatted = masjids.map((m) => ({
      _id: m._id.toString(),
      name: m.name,
      areaId: m.area?.toString() || null,
      cityId: m.city?.toString() || null,
    }));

    // Cache for 10 minutes
    cache = {
      data: formatted,
      expires: now + 10 * 60 * 1000,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("Masjid index error:", err);
    return NextResponse.json(
      { message: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}
