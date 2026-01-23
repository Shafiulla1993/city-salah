// src/app/api/public/masjids/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  /* ===============================
     CANONICAL (by-slug)
  =============================== */
  if (mode === "by-slug") {
    const citySlug = searchParams.get("citySlug");
    const areaSlug = searchParams.get("areaSlug");
    const masjidSlug = searchParams.get("masjidSlug");

    const city = await City.findOne({ slug: citySlug });
    const area = await Area.findOne({ slug: areaSlug, city: city?._id });
    const masjid = await Masjid.findOne({
      slug: masjidSlug,
      city: city?._id,
      area: area?._id,
    })
      .populate("city", "name slug timezone")
      .populate("area", "name slug")
      .lean();

    if (!city || !area || !masjid)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({
      city: masjid.city,
      area: masjid.area,
      masjid: {
        _id: masjid._id.toString(),
        name: masjid.name,
        slug: masjid.slug,
        address: masjid.address || "",
        imageUrl: masjid.imageUrl || "",
        imageThumbUrl: masjid.imageThumbUrl || "",
        contacts: masjid.contacts || [],
        ladiesPrayerFacility: !!masjid.ladiesPrayerFacility,
        location: masjid.location,
      },
    });
  }

  /* ===============================
     NEAREST (geo)
  =============================== */
  if (mode === "nearest") {
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));

    if (isNaN(lat) || isNaN(lng))
      return NextResponse.json({ message: "Invalid coords" }, { status: 400 });

    const nearest = await Masjid.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 20000,
        },
      },
      status: "active",
    })
      .populate("city", "name slug timezone")
      .populate("area", "name slug")
      .lean();

    if (!nearest)
      return NextResponse.json(
        { message: "No nearby masjid" },
        { status: 404 },
      );

    return NextResponse.json({
      city: nearest.city,
      area: nearest.area,
      masjid: {
        _id: nearest._id.toString(),
        name: nearest.name,
        slug: nearest.slug,
      },
    });
  }

  /* ===============================
     FEED
  =============================== */
  if (mode === "feed") {
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Number(searchParams.get("limit") || 10), 20);
    const cityId = searchParams.get("cityId");
    const areaId = searchParams.get("areaId");

    const filter = {};
    if (cityId) filter.city = cityId;
    if (areaId) filter.area = areaId;

    const total = await Masjid.countDocuments(filter);

    const rows = await Masjid.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("city", "name slug")
      .populate("area", "name slug")
      .lean();

    return NextResponse.json({
      data: rows.map((m) => ({
        _id: m._id.toString(),
        name: m.name,
        slug: m.slug,
        citySlug: m.city.slug,
        cityName: m.city.name,
        areaSlug: m.area.slug,
        areaName: m.area.name,
        imageThumbUrl:
          m.imageThumbUrl ||
          (m.imageUrl
            ? m.imageUrl.replace(
                "/upload/",
                "/upload/w_400,h_300,c_fill,q_auto,f_auto/",
              )
            : ""),
      })),
      total,
      page,
      limit,
    });
  }

  /* ===============================
     SEARCH INDEX
  =============================== */
  if (mode === "index") {
    const cityId = searchParams.get("cityId");

    const filter = {};
    if (cityId) filter.city = cityId;

    const rows = await Masjid.find(filter)
      .populate("city", "name slug")
      .populate("area", "name slug")
      .lean();

    return NextResponse.json(
      rows.map((m) => ({
        _id: m._id.toString(),
        name: m.name,
        slug: m.slug,
        citySlug: m.city.slug,
        cityName: m.city.name,
        areaSlug: m.area.slug,
        areaName: m.area.name,
      })),
    );
  }

  return NextResponse.json({ message: "Invalid mode" }, { status: 400 });
}
