// src/app/api/public/ramzan-timetable/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

import City from "@/models/City";
import Area from "@/models/Area";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

import { getHijriOffset } from "@/lib/hijri/getHijriOffset";
import { computeHijri } from "@/lib/hijri/computeHijri";
import { computeAuqatusFromCoords } from "@/lib/prayer/prayTimesEngine";

/* ---------------- helpers ---------------- */

function getDayKey(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function addMin(min, add) {
  return (min + add + 1440) % 1440;
}

function minutesToTime(min) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

/* ---------------- handler ---------------- */

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("citySlug");
  const areaSlug = searchParams.get("areaSlug");

  if (!citySlug) {
    return NextResponse.json(
      { success: false, message: "citySlug required" },
      { status: 400 },
    );
  }

  /* ---------- resolve city / area ---------- */

  const city = await City.findOne({ slug: citySlug }).lean();
  if (!city) {
    return NextResponse.json(
      { success: false, message: "City not found" },
      { status: 404 },
    );
  }

  let area = null;
  if (areaSlug) {
    area = await Area.findOne({ slug: areaSlug, city: city._id }).lean();
  }

  if (!area && areaSlug) {
    return NextResponse.json(
      { success: false, message: "Area not found" },
      { status: 404 },
    );
  }

  /* ---------- coords (canonical only) ---------- */

  let lat, lng;

  if (area?.center?.coordinates?.length === 2) {
    lng = area.center.coordinates[0];
    lat = area.center.coordinates[1];
  } else if (city?.coords?.lat && city?.coords?.lon) {
    lat = city.coords.lat;
    lng = city.coords.lon;
  } else {
    return NextResponse.json(
      { success: false, message: "No coordinates available" },
      { status: 400 },
    );
  }

  /* ---------- hijri offset ---------- */

  const hijriOffset = await getHijriOffset({
    cityId: city._id,
    areaId: area?._id || null,
  });

  /* ---------- step 1: find ramzan window ---------- */
  /**
   * We don’t guess dates.
   * We scan forward day-by-day until Hijri month changes.
   */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ramzanDays = [];
  let date = new Date(today);

  while (true) {
    const hijri = computeHijri(date, hijriOffset);

    if (hijri.month !== 9) {
      if (ramzanDays.length > 0) break; // ramzan ended
      date.setDate(date.getDate() + 1);
      continue; // not yet started
    }

    ramzanDays.push(new Date(date));
    date.setDate(date.getDate() + 1);

    if (ramzanDays.length > 31) break; // safety guard
  }

  /* ---------- step 2: ensure daily cache ---------- */

  for (const d of ramzanDays) {
    const dayKey = getDayKey(d);

    const exists = await GeneralPrayerTiming.findOne({
      city: city._id,
      area: area?._id || null,
      dayKey,
    }).lean();

    if (exists) continue;

    const auqatus = computeAuqatusFromCoords({
      lat,
      lng,
      date: d,
      timezoneOffset:
        typeof city.timezoneOffset === "number"
          ? city.timezoneOffset
          : Math.round((lng / 15) * 2) / 2,
    });

    const hijri = computeHijri(d, hijriOffset);
    const rozaNumber = hijri.day;

    await GeneralPrayerTiming.create({
      city: city._id,
      area: area?._id || null,
      dayKey,
      hijri,
      rozaNumber,
      slots: auqatus,
    });
  }

  /* ---------- step 3: read full ramzan ---------- */

  const rows = await GeneralPrayerTiming.find({
    city: city._id,
    area: area?._id || null,
    "hijri.month": 9,
  })
    .sort({ dayKey: 1 })
    .lean();

  const days = rows.map((r) => {
    const map = Object.fromEntries(r.slots.map((s) => [s.name, s.time]));

    const sehriEnd = map.sehri_end;
    const iftar = addMin(map.maghrib_start, 2);

    return {
      dayKey: r.dayKey,
      date: `${new Date().getFullYear()}-${r.dayKey}`,
      hijri: r.hijri,
      rozaNumber: r.rozaNumber,
      sehriEnd,
      iftar,
      sehriEndText: minutesToTime(sehriEnd),
      iftarText: minutesToTime(iftar),
    };
  });

  return NextResponse.json({
    success: true,
    city: city.slug,
    area: area?.slug || null,
    ramzanActive: days.length > 0,
    days,
  });
}
