// src/server/services/prayerResolver.js

import { minutesToHHMM, to24Hour } from "@/lib/prayer/timeHelpers";

/* ---------------------------------------------
   Normalize any stored time to "HH:MM"
   - number  -> minutes from midnight
   - "340"   -> minutes from midnight (string)
   - "05:15 AM" or "17:15" -> converted to 24h
   - null / "" -> ""
--------------------------------------------- */
function normalizeTime(val) {
  if (val === null || val === undefined || val === "") return "";

  // Minutes (number)
  if (typeof val === "number" && !Number.isNaN(val)) {
    return minutesToHHMM(val);
  }

  // Minutes as string "340"
  if (typeof val === "string" && /^\d+$/.test(val)) {
    return minutesToHHMM(Number(val));
  }

  // Time string "05:15 AM" or "17:15"
  if (typeof val === "string") {
    return to24Hour(val);
  }

  return "";
}

/* ---------------------------------------------
   Main Resolver (LOCKED & SAFE)
--------------------------------------------- */
export function resolvePrayerTimings({ config }) {
  const resolved = {};

  for (const rule of config.rules || []) {
    const prayer = rule.prayer;

    // MANUAL PRAYERS
    if (rule.mode === "manual") {
      resolved[prayer] = {
        azan: normalizeTime(rule.manual?.azan),
        iqaamat: normalizeTime(rule.manual?.iqaamat),
      };
      continue;
    }

    // AUTO PRAYERS (Maghrib already computed & stored)
    if (rule.mode === "auto" && rule.lastComputed) {
      resolved[prayer] = {
        azan: normalizeTime(rule.lastComputed?.azan),
        iqaamat: normalizeTime(rule.lastComputed?.iqaamat),
        source: rule.auto?.source || "auto",
        syncedAt: rule.lastComputed?.syncedAt || null,
      };
      continue;
    }

    // Fallback
    resolved[prayer] = { azan: "", iqaamat: "" };
  }

  return resolved;
}
