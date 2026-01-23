// src/server/services/prayerCacheWindow.js

import { hhmmToMinutes } from "@/lib/prayer/timeHelpers";

export function getSecondsToNextPrayer(timings) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const order = ["fajr", "zohar", "asr", "maghrib", "isha"];

  const minutesList = order
    .map((p) => timings[p]?.azan)
    .filter(Boolean)
    .map(hhmmToMinutes)
    .sort((a, b) => a - b);

  let nextMin = minutesList.find((m) => m > nowMin);

  if (!nextMin) nextMin = minutesList[0] + 24 * 60; // tomorrow fajr

  const diffMin = nextMin - nowMin;
  return diffMin * 60;
}
