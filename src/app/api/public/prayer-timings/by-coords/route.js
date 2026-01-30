// src/app/api/public/prayer-timings/by-coords/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

import Area from "@/models/Area";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

import { getHijriOffset } from "@/lib/hijri/getHijriOffset";
import { computeHijri } from "@/lib/hijri/computeHijri";
import { computeAuqatusFromCoords } from "@/lib/prayer/prayTimesEngine";

/* ---------- helpers ---------- */

function getDayKey(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function fallbackTimezoneOffset(lng) {
  return Math.round((lng / 15) * 2) / 2;
}

/* ---------- handler ---------- */

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: "lat/lng required" },
        { status: 400 },
      );
    }

    const area = await Area.findOne({
      "center.coordinates.0": { $ne: null },
      "center.coordinates.1": { $ne: null },
    }).populate("city");

    if (!area?.city) {
      return NextResponse.json(
        { success: false, message: "No city resolved" },
        { status: 404 },
      );
    }

    const city = area.city;
    const today = new Date();
    const dayKey = getDayKey(today);

    const hijriOffset = await getHijriOffset({
      cityId: city._id,
      areaId: area._id,
    });

    const timezoneOffset =
      typeof city.timezoneOffset === "number"
        ? city.timezoneOffset
        : fallbackTimezoneOffset(lng);

    const cached = await GeneralPrayerTiming.findOne({
      city: city._id,
      area: area._id,
      dayKey,
    }).lean();

    if (cached?.hijri && cached?.slots?.length) {
      return NextResponse.json({
        success: true,
        hijri: cached.hijri,
        rozaNumber: cached.rozaNumber,
        slots: cached.slots,
      });
    }

    const auqatus = computeAuqatusFromCoords({
      lat,
      lng,
      date: today,
      timezoneOffset,
    });

    const hijri = computeHijri(today, hijriOffset);
    const rozaNumber = hijri.month === 9 ? hijri.day : null;

    await GeneralPrayerTiming.updateOne(
      { city: city._id, area: area._id, dayKey },
      {
        city: city._id,
        area: area._id,
        dayKey,
        hijri,
        rozaNumber,
        slots: auqatus,
        updatedAt: new Date(),
      },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      hijri,
      rozaNumber,
      slots: auqatus,
    });
  } catch (err) {
    console.error("prayer-timings/by-coords error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal error" },
      { status: 500 },
    );
  }
}
