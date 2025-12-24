// src/app/api/public/masjids/[id]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";
import mongoose from "mongoose";

export async function GET(request, context) {
  try {
    await connectDB();

    // ✅ IMPORTANT: params is async in Next.js 16
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Masjid identifier is required" },
        { status: 400 }
      );
    }

    let masjid = null;

    /* --------------------------------
       1️⃣ slug-id (SEO format)
    --------------------------------- */
    const parts = id.split("-");
    const lastPart = parts[parts.length - 1];

    if (mongoose.Types.ObjectId.isValid(lastPart)) {
      masjid = await Masjid.findById(lastPart)
        .populate("city", "name slug timezone")
        .populate("area", "name slug")
        .lean();
    }

    /* --------------------------------
       2️⃣ pure ObjectId
    --------------------------------- */
    if (!masjid && mongoose.Types.ObjectId.isValid(id)) {
      masjid = await Masjid.findById(id)
        .populate("city", "name slug timezone")
        .populate("area", "name slug")
        .lean();
    }

    /* --------------------------------
       3️⃣ slug only
    --------------------------------- */
    if (!masjid) {
      masjid = await Masjid.findOne({ slug: id })
        .populate("city", "name slug timezone")
        .populate("area", "name slug")
        .lean();
    }

    if (!masjid) {
      return NextResponse.json(
        { message: "Masjid not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        _id: masjid._id.toString(),
        name: masjid.name,
        slug: masjid.slug,
        address: masjid.address || "",
        city: masjid.city
          ? {
              _id: masjid.city._id.toString(),
              name: masjid.city.name,
              slug: masjid.city.slug,
              timezone: masjid.city.timezone,
            }
          : null,
        area: masjid.area
          ? {
              _id: masjid.area._id.toString(),
              name: masjid.area.name,
              slug: masjid.area.slug,
            }
          : null,
        imageUrl: masjid.imageUrl || "",
        imageThumbUrl: masjid.imageThumbUrl || "",
        contacts: Array.isArray(masjid.contacts) ? masjid.contacts : [],
        ladiesPrayerFacility: !!masjid.ladiesPrayerFacility,
        prayerTimings: masjid.prayerTimings || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Masjid API error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
