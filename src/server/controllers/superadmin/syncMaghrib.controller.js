// src/server/controllers/superadmin/syncMaghrib.controller.js

import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import GeneralTimingMapping from "@/models/GeneralTimingMapping";
import "@/models/GeneralTimingTemplate";

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
  /* ---------------- Fetch template mapping ---------------- */
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

  /* ---------------- Resolve dateKey ---------------- */
  const dateKey = new Date(date)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
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

  /* ---------------- Fetch masjid configs ---------------- */
  const configs = await MasjidPrayerConfig.find().populate({
    path: "masjid",
    match: { city: cityId },
    select: "_id name",
  });

  let updated = 0;
  let skipped = 0;
  const skippedMasjids = [];
  const now = new Date();

  for (const config of configs) {
    if (!config.masjid) continue;

    const rule = config.rules.find((r) => r.prayer === "maghrib");
    if (!rule || rule.mode !== "auto" || !rule.auto) {
      skipped++;
      skippedMasjids.push(config.masjid.name);
      continue;
    }

    /* 🔐 SAFETY CHECK (FIX 3) */
    if (
      rule.auto.azan_offset_minutes == null ||
      rule.auto.iqaamat_offset_minutes == null
    ) {
      console.warn(
        `[Maghrib Sync] Missing offsets for masjid ${config.masjid.name}`
      );
      skipped++;
      skippedMasjids.push(config.masjid.name);
      continue;
    }

    const azanMinutes = maghribSlot.time + rule.auto.azan_offset_minutes;

    const iqaamatMinutes = azanMinutes + rule.auto.iqaamat_offset_minutes;

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
      skipped,
      skippedMasjids,
      syncedAt: now,
      message:
        skipped > 0
          ? "Maghrib synced with warnings"
          : "Maghrib synced successfully",
    },
  };
}
