// src/server/services/resolveMasjidTimings.js

import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { resolvePrayerTimings } from "./prayerResolver";
import { minutesToHHMM } from "@/lib/prayer/timeHelpers";
import { getTodayMaghribFromDayKey } from "./getTodayMaghribFromDayKey";

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function resolveMasjidTimings({ masjidId, citySlug, areaSlug }) {
  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId });
  if (!config) return {};

  const maghribRule = config.rules.find((r) => r.prayer === "maghrib");
  if (!maghribRule) {
    return resolvePrayerTimings({ config: config.toObject() });
  }

  const last = maghribRule.lastComputed?.syncedAt;
  const alreadyToday = last && isSameDay(new Date(last), new Date());

  if (!alreadyToday) {
    const base = await getTodayMaghribFromDayKey(citySlug, areaSlug);

    if (base !== null) {
      const azanOffset = maghribRule.auto?.azan_offset_minutes || 0;
      const iqamatOffset = maghribRule.auto?.iqaamat_offset_minutes || 3;

      maghribRule.lastComputed = {
        azan: minutesToHHMM(base + azanOffset),
        iqaamat: minutesToHHMM(base + iqamatOffset),
        syncedAt: new Date(),
        source: "auqatus_salah",
      };

      await config.save();
    }
  }

  return resolvePrayerTimings({ config: config.toObject() });
}
