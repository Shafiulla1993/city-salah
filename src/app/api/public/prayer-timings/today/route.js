// src/app/api/ppublic/rayer-timings/today/route.js

import connectDB from "@/lib/db";
import { computeAuqatusFromCoords } from "@/lib/prayer/prayTimesEngine";
import City from "@/models/City";
import Area from "@/models/Area";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("citySlug");
  const areaSlug = searchParams.get("areaSlug");
  const dateStr = searchParams.get("date");

  if (!citySlug || !areaSlug || !dateStr) {
    return Response.json(
      { success: false, message: "citySlug, areaSlug and date are required" },
      { status: 400 },
    );
  }

  const city = await City.findOne({ slug: citySlug });
  if (!city) {
    return Response.json(
      { success: false, message: "City not found" },
      { status: 404 },
    );
  }

  const area = await Area.findOne({ slug: areaSlug, city: city._id });

  /* ---------------- Coordinates Resolution ---------------- */

  let lat = null;
  let lng = null;

  // 1️⃣ Prefer Area center (GeoJSON: [lng, lat])
  if (area?.center?.coordinates?.length === 2) {
    lng = area.center.coordinates[0];
    lat = area.center.coordinates[1];
  }
  // 2️⃣ Fallback to City coords
  else if (city?.coords?.lat && city?.coords?.lon) {
    lat = city.coords.lat;
    lng = city.coords.lon;
  }
  // 3️⃣ Nothing available
  else {
    return Response.json(
      { success: false, message: "No coordinates found for area or city" },
      { status: 400 },
    );
  }

  /* ---------------- PrayTimes ---------------- */

  const date = new Date(dateStr);

  const slots = computeAuqatusFromCoords({
    lat,
    lng,
    date,
  });

  /* ---------------- DayKey Cache ---------------- */

  const dayKey = dateStr.slice(5); // MM-DD

  await GeneralPrayerTiming.updateOne(
    { city: city._id, area: area?._id || null, dayKey },
    {
      city: city._id,
      area: area?._id || null,
      dayKey,
      slots,
      source: "praytimes",
      updatedAt: new Date(),
    },
    { upsert: true },
  );

  return Response.json({
    success: true,
    city,
    area,
    dayKey,
    slots,
  });
}
