// src/server/controllers/superadmin/syncMaghrib.controller.js

import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import GeneralTimingTemplate from "@/models/GeneralTimingTemplate";
import GeneralTimingMapping from "@/models/GeneralTimingMapping";

function minutesToTime(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )} ${suffix}`;
}

export async function syncMaghribController({ cityId, date }) {
  // 1️⃣ Get template
  const mapping = await GeneralTimingMapping.findOne({
    city: cityId,
    area: null,
  })
    .populate("template")
    .lean();

  if (!mapping?.template) {
    return {
      status: 400,
      json: { success: false, message: "No timing template mapped" },
    };
  }

  const dateKey = new Date(date)
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })
    .replace(" ", "-");

  const day = mapping.template.days.find((d) => d.dateKey === dateKey);
  if (!day) {
    return {
      status: 400,
      json: { success: false, message: "No timings for this date" },
    };
  }

  const maghribSlot = day.slots.find((s) => s.name === "maghrib_start");
  if (!maghribSlot) {
    return {
      status: 400,
      json: { success: false, message: "Maghrib slot missing" },
    };
  }

  // 2️⃣ Fetch configs for this city
  const configs = await MasjidPrayerConfig.find().populate({
    path: "masjid",
    match: { city: cityId },
    select: "_id",
  });

  const now = new Date();
  let updated = 0;

  for (const config of configs) {
    if (!config.masjid) continue;

    const rule = config.rules.find((r) => r.prayer === "maghrib");
    if (!rule || rule.mode !== "auto") continue;

    const azanMinutes =
      maghribSlot.time + (rule.auto?.azan_offset_minutes || 0);

    const iqaamatMinutes =
      azanMinutes + (rule.auto?.iqaamat_offset_minutes || 0);

    rule.lastComputed = {
      azan: minutesToTime(azanMinutes),
      iqaamat: minutesToTime(iqaamatMinutes),
      syncedAt: now,
    };

    await config.save();
    updated++;
  }

  return {
    status: 200,
    json: {
      success: true,
      updated,
      syncedAt: now,
      message: "Maghrib synced successfully",
    },
  };
}
