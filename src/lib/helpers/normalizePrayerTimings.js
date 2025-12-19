// src/lib/helpers/normalizePrayerTimings.js

export function normalizePrayerTimings(raw = {}) {
  return {
    fajr: raw.fajr || {},
    zohar: raw.zohar || raw.Zohar || {}, // ✅ FIX
    asr: raw.asr || {},
    maghrib: raw.maghrib || {},
    isha: raw.isha || {},
    juma: raw.juma || {},
  };
}
