// src/app/api/public/masjids/feed/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Number(searchParams.get("limit") || 10), 20);

  const cityId = searchParams.get("cityId");
  const areaId = searchParams.get("areaId");

  const filter = {};
  if (cityId) filter.city = cityId;
  if (areaId) filter.area = areaId;

  const total = await Masjid.countDocuments(filter);

  const masjids = await Masjid.find(filter)
    .sort({ createdAt: -1 }) // 🔥 newest first
    .skip((page - 1) * limit)
    .limit(limit)
    .select("_id name slug imageUrl imageThumbUrl city area createdAt")
    .populate("city", "name")
    .populate("area", "name")
    .lean();

  return NextResponse.json({
    data: masjids.map((m) => ({
      _id: m._id.toString(),
      name: m.name,
      slug: m.slug,
      cityName: m.city?.name || "",
      areaName: m.area?.name || "",
      imageThumbUrl:
        m.imageThumbUrl ||
        (m.imageUrl
          ? m.imageUrl.replace(
              "/upload/",
              "/upload/w_400,h_300,c_fill,q_auto,f_auto/"
            )
          : ""),
      createdAt: m.createdAt,
    })),
    total,
    page,
    limit,
  });
}
