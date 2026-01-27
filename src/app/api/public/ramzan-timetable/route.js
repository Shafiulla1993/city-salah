// src/app/api/public/ramzan-timetable/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";
import RamzanConfig from "@/models/RamzanConfig";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

/* ---------------- DayKey Helpers ---------------- */

function getDayKeyFromDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function minutesToTime(min) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

/* ---------------- API ---------------- */

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const citySlug = searchParams.get("citySlug");
    const areaSlug = searchParams.get("areaSlug");

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

    /* Load Active Ramzan Config */
    let config = null;

    if (area) {
      config = await RamzanConfig.findOne({
        city: city._id,
        area: area._id,
        active: true,
      }).lean();
    }

    if (!config) {
      config = await RamzanConfig.findOne({
        city: city._id,
        area: null,
        active: true,
      }).lean();
    }

    if (!config) {
      return NextResponse.json({
        success: true,
        city: city.slug,
        area: area?.slug || null,
        ramzanActive: false,
        days: [],
      });
    }

    const start = new Date(config.startDate);
    const end = new Date(config.endDate);

    const result = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayKey = getDayKeyFromDate(d);

      let timing = null;

      /* 1) Area-specific source */
      if (config.sourceArea) {
        timing = await GeneralPrayerTiming.findOne({
          city: config.sourceCity,
          area: config.sourceArea,
          dayKey,
        }).lean();
      }

      /* 2) City fallback */
      if (!timing) {
        timing = await GeneralPrayerTiming.findOne({
          city: config.sourceCity,
          area: null,
          dayKey,
        }).lean();
      }

      if (!timing) continue;

      const sehriEnd = timing.slots.find((s) => s.name === "sehri_end")?.time;
      const maghrib = timing.slots.find(
        (s) => s.name === "maghrib_start",
      )?.time;

      if (sehriEnd == null || maghrib == null) continue;

      result.push({
        date: new Date(d),
        dayKey,
        sehriEnd,
        iftar: maghrib + config.iftarOffsetMinutes,
        sehriEndText: minutesToTime(sehriEnd),
        iftarText: minutesToTime(maghrib + config.iftarOffsetMinutes),
      });
    }

    return NextResponse.json({
      success: true,
      city: city.slug,
      area: area?.slug || null,
      ramzanActive: true,
      startDate: config.startDate,
      endDate: config.endDate,
      iftarOffsetMinutes: config.iftarOffsetMinutes,
      days: result,
      source: "daykey",
    });
  } catch (error) {
    console.error("Public Ramzan Timetable API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
