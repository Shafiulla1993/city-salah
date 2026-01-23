// src/app/api/public/timings/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { resolveMasjidTimings } from "@/server/services/resolveMasjidTimings";
import { getSecondsToNextPrayer } from "@/server/services/prayerCacheWindow";

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

  // 1. Ensure config exists
  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId }).lean();
  if (!config) {
    return NextResponse.json({ message: "Config not found" }, { status: 404 });
  }

  // 2. Resolve ONLY cached + synced values (no recompute)
  const timings = await resolveMasjidTimings({ masjidId });

  // 3. Compute ISR window (prayer boundary based)
  const secondsToNextPrayer = getSecondsToNextPrayer(timings);
  const revalidate = Math.min(3600, Math.max(30, secondsToNextPrayer));

  return NextResponse.json(
    { data: timings, revalidate },
    { next: { revalidate } },
  );
}
