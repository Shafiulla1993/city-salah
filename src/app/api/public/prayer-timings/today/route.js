// src/app/api/ppublic/rayer-timings/today/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

/* ---------------- DayKey Helpers ---------------- */

function getTodayDayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function getDayKeyFromDate(dateStr) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/* ---------------- API ---------------- */

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const citySlug = searchParams.get("citySlug");
    const areaSlug = searchParams.get("areaSlug");
    const dateParam = searchParams.get("date"); // optional: YYYY-MM-DD

    if (!citySlug) {
      return NextResponse.json(
        { success: false, message: "citySlug is required" },
        { status: 400 },
      );
    }

    /* Resolve City */
    const city = await City.findOne({ slug: citySlug }).lean();
    if (!city) {
      return NextResponse.json(
        { success: false, message: "City not found" },
        { status: 404 },
      );
    }

    /* Resolve Area (optional) */
    let area = null;
    if (areaSlug) {
      area = await Area.findOne({ slug: areaSlug, city: city._id }).lean();
    }

    /* DayKey (today or override) */
    const dayKey = dateParam ? getDayKeyFromDate(dateParam) : getTodayDayKey();

    /* 1) Area-specific timings */
    let timing = null;

    if (area) {
      timing = await GeneralPrayerTiming.findOne({
        city: city._id,
        area: area._id,
        dayKey,
      }).lean();
    }

    /* 2) City fallback */
    if (!timing) {
      timing = await GeneralPrayerTiming.findOne({
        city: city._id,
        area: null,
        dayKey,
      }).lean();
    }

    if (!timing) {
      return NextResponse.json({
        success: true,
        city: city.slug,
        area: area?.slug || null,
        dayKey,
        slots: [],
        source: "none",
      });
    }

    return NextResponse.json({
      success: true,
      city: city.slug,
      area: area?.slug || null,
      dayKey,
      slots: timing.slots,
      source: "daykey",
    });
  } catch (error) {
    console.error("Public Awqatus Salah API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
