// src/app/api/public/masjids/index/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";

let cache = {
  data: null,
  expires: 0,
};

export async function GET(req) {
  try {
    const now = Date.now();
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("city") || "ALL";

    const cacheKey = `masjids_index_${cityId}`;

    // -----------------------------
    // Cache (10 minutes per query)
    // -----------------------------
    if (cache[cacheKey] && cache[cacheKey].expires > now) {
      return NextResponse.json(cache[cacheKey].data);
    }

    await connectDB();

    const filter = {};
    if (cityId !== "ALL") filter.city = cityId;

    const masjids = await Masjid.find(filter)
      .select("_id name slug city area imageUrl imageThumbUrl")
      .populate("city", "name")
      .populate("area", "name")
      .lean();

    const formatted = masjids.map((m) => ({
      _id: m._id.toString(), // ✅ stable unique key
      slug: m.slug,
      name: m.name,

      areaId: m.area?._id?.toString() || null,
      areaName: m.area?.name || "",

      cityId: m.city?._id?.toString() || null,
      cityName: m.city?.name || "",

      imageThumbUrl:
        m.imageThumbUrl ||
        (m.imageUrl
          ? m.imageUrl.replace(
              "/upload/",
              "/upload/w_400,h_300,c_fill,q_auto,f_auto/"
            )
          : ""),
    }));

    cache[cacheKey] = {
      data: formatted,
      expires: now + 10 * 60 * 1000,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Masjid index error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load masjid index" },
      { status: 500 }
    );
  }
}
