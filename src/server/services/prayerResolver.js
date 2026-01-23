// src/server/services/prayerResolver.js

import { to24Hour } from "@/lib/prayer/timeHelpers";

const ALL_PRAYERS = ["fajr", "zohar", "asr", "maghrib", "isha", "juma"];

/**
 * This resolver NEVER recalculates.
 * It only returns cached + synced values.
 * Maghrib auto-sync is written by the sync job.
 */
export function resolvePrayerTimings({ config }) {
  const timings = {};

  for (const prayer of ALL_PRAYERS) {
    const rule = config?.rules?.find((r) => r.prayer === prayer);

    if (!rule) {
      timings[prayer] = { azan: "", iqaamat: "" };
      continue;
    }

    // Manual
    if (rule.mode === "manual") {
      timings[prayer] = {
        azan: to24Hour(rule.manual?.azan || ""),
        iqaamat: to24Hour(rule.manual?.iqaamat || ""),
      };
      continue;
    }

    // Auto (Maghrib, etc)
    timings[prayer] = {
      azan: to24Hour(rule.lastComputed?.azan || ""),
      iqaamat: to24Hour(rule.lastComputed?.iqaamat || ""),
      syncedAt: rule.lastComputed?.syncedAt || null,
      source: rule.auto?.source || "auqatus_salah",
    };
  }

  return timings;
}
