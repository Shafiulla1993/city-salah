// src/api/public/general-timings/route.js

import { NextResponse } from "next/server";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import GeneralTimingMapping from "@/models/GeneralTimingMapping";
import GeneralTimingTemplate from "@/models/GeneralTimingTemplate";

function formatDateKey(isoDate) {
  const d = new Date(isoDate);
  const day = d.getDate();
  const mon = d.toLocaleString("en-US", { month: "short" });
  return `${day}-${mon}`;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const cityId = url.searchParams.get("cityId");
    const areaId = url.searchParams.get("areaId") || null;
    const date = url.searchParams.get("date");

    if (!cityId || !date) {
      return NextResponse.json(
        { success: false, message: "cityId & date required" },
        { status: 400 }
      );
    }

    /* 1️⃣ Try manual timings first */
    const manual = await GeneralPrayerTiming.findOne({
      city: cityId,
      ...(areaId ? { area: areaId } : { area: null }),
      date,
    }).lean();

    if (manual) {
      return NextResponse.json(
        { success: true, source: "manual", data: manual },
        { status: 200 }
      );
    }

    /* 2️⃣ Fetch mapping */
    let mapping = null;

    if (areaId) {
      mapping = await GeneralTimingMapping.findOne({
        city: cityId,
        area: areaId,
      });
    }

    if (!mapping) {
      mapping = await GeneralTimingMapping.findOne({
        city: cityId,
        area: null,
      });
    }

    if (!mapping) {
      return NextResponse.json(
        { success: true, source: "none", data: [] },
        { status: 200 }
      );
    }

    /* 3️⃣ Template fallback */
    const template = await GeneralTimingTemplate.findById(
      mapping.template
    ).lean();
    if (!template?.days?.length) {
      return NextResponse.json(
        { success: true, source: "none", data: [] },
        { status: 200 }
      );
    }

    const key = formatDateKey(date);
    const match = template.days.find((d) => d.dateKey === key);

    return NextResponse.json(
      {
        success: true,
        source: match ? "template" : "none",
        data: match
          ? { city: cityId, area: areaId || null, date, slots: match.slots }
          : [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("public/general-timings ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
