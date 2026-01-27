// src/app/api/super-admin/ramzan-config/preview/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import RamzanConfig from "@/models/RamzanConfig";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

function toDayKey(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

export const GET = withAuth("super_admin", async (req) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const configId = searchParams.get("configId");

  if (!configId) {
    return Response.json(
      { success: false, message: "configId required" },
      { status: 400 },
    );
  }

  const config = await RamzanConfig.findById(configId);
  if (!config) {
    return Response.json(
      { success: false, message: "Config not found" },
      { status: 404 },
    );
  }

  const days = [];
  const start = new Date(config.startDate);
  const end = new Date(config.endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayKey = toDayKey(d);

    let timing = await GeneralPrayerTiming.findOne({
      city: config.sourceCity,
      area: config.sourceArea || null,
      dayKey,
    });

    if (!timing) continue;

    const sehri = timing.slots.find((s) => s.name === "sehri_end")?.time;
    const maghrib = timing.slots.find((s) => s.name === "maghrib_start")?.time;

    if (sehri == null || maghrib == null) continue;

    days.push({
      date: d,
      dayKey,
      sehriEnd: sehri,
      iftar: maghrib + config.iftarOffsetMinutes,
    });
  }

  return Response.json({
    success: true,
    days,
  });
});
