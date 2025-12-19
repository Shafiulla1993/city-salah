// src/server/services/prayerResolver.js

const ALL_PRAYERS = ["fajr", "zohar", "asr", "maghrib", "isha", "juma"];

export function resolvePrayerTimings({ config }) {
  const timings = {};

  for (const prayer of ALL_PRAYERS) {
    const rule = config?.rules?.find((r) => r.prayer === prayer);

    if (!rule) {
      timings[prayer] = { azan: "", iqaamat: "" };
      continue;
    }

    if (rule.mode === "manual") {
      timings[prayer] = {
        azan: rule.manual?.azan || "",
        iqaamat: rule.manual?.iqaamat || "",
      };
      continue;
    }

    // 🔥 AUTO MODE (USE CACHED VALUE)
    timings[prayer] = {
      azan: rule.lastComputed?.azan || "AUTO",
      iqaamat: rule.lastComputed?.iqaamat || "AUTO",
      syncedAt: rule.lastComputed?.syncedAt || null,
      source: rule.auto?.source,
    };
  }

  return timings;
}
