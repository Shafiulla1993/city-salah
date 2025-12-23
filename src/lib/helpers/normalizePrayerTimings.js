// src/lib/helpers/normalizePrayerTimings.js
export function normalizePrayerTimings(raw = {}) {
  const PRAYERS = ["fajr", "zohar", "asr", "maghrib", "isha", "juma"];
  const out = {};

  for (const p of PRAYERS) {
    const r = raw[p] || {};

    out[p] = {
      azan: r.azan || "",
      iqaamat: r.iqaamat || "",
      syncedAt: r.syncedAt || null,
      source: r.source || null,
    };
  }

  return out;
}
