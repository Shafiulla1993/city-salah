// src/app/api/public/timings/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { resolveMasjidTimings } from "@/server/services/resolveMasjidTimings";
import { getSecondsToNextPrayer } from "@/server/services/prayerCacheWindow";
import { hhmmToMinutes, minutesToAMPM } from "@/lib/prayer/timeHelpers";

/* ---------------- Format Helpers ---------------- */

function toAMPM(val) {
  if (val === null || val === undefined || val === "") return "";

  // number or numeric string (minutes)
  if (!isNaN(val)) {
    return minutesToAMPM(Number(val));
  }

  // "HH:MM"
  return minutesToAMPM(hhmmToMinutes(val));
}

function formatToAMPM(p) {
  if (!p) return { azan: "", iqaamat: "" };

  return {
    ...p,
    azan: toAMPM(p.azan),
    iqaamat: toAMPM(p.iqaamat),
  };
}

/* ---------------- API ---------------- */

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const masjidId = searchParams.get("masjidId");

  if (!masjidId) {
    return NextResponse.json(
      { message: "Masjid ID required" },
      { status: 400 },
    );
  }

  // 1. Load masjid with city & area slugs (for Maghrib sync)
  const masjid = await Masjid.findById(masjidId)
    .populate("city", "slug")
    .populate("area", "slug")
    .lean();

  if (!masjid || !masjid.city || !masjid.area) {
    return NextResponse.json({ message: "Masjid not found" }, { status: 404 });
  }

  // 2. Ensure prayer config exists
  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId }).lean();
  if (!config) {
    return NextResponse.json({ message: "Config not found" }, { status: 404 });
  }

  // 3. Resolve timings (this will auto-sync Maghrib from DayKey)
  const timings = await resolveMasjidTimings({
    masjidId,
    citySlug: masjid.city.slug,
    areaSlug: masjid.area.slug,
  });

  // 4. Convert to AM/PM for public UI
  const formattedTimings = {
    fajr: formatToAMPM(timings.fajr),
    zohar: formatToAMPM(timings.zohar),
    asr: formatToAMPM(timings.asr),
    maghrib: formatToAMPM(timings.maghrib),
    isha: formatToAMPM(timings.isha),
    juma: formatToAMPM(timings.juma),
  };

  // 5. ISR window
  const secondsToNextPrayer = getSecondsToNextPrayer(formattedTimings);
  const revalidate = Math.min(3600, Math.max(30, secondsToNextPrayer));

  return NextResponse.json(
    { data: formattedTimings, revalidate },
    { next: { revalidate } },
  );
}
