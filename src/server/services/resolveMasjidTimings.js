// src/server/services/resolveMasjidTimings.js

import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import GeneralTimingMapping from "@/models/GeneralTimingMapping";
import GeneralTimingTemplate from "@/models/GeneralTimingTemplate";
import { resolvePrayerTimings } from "./prayerResolver";

export async function resolveMasjidTimings({
  masjidId,
  cityId,
  date = new Date(),
}) {
  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId });
  if (!config) return {};

  const dayKey = date.toISOString().slice(0, 10);

  // Check if any auto rule exists
  const autoRules = config.rules.filter((r) => r.mode === "auto");

  if (autoRules.length) {
    const mapping = await GeneralTimingMapping.findOne({ city: cityId });
    if (mapping) {
      const template = await GeneralTimingTemplate.findById(mapping.template);

      for (const rule of autoRules) {
        const alreadyToday =
          rule.lastComputed?.syncedAt?.toISOString()?.slice(0, 10) === dayKey;

        if (alreadyToday) continue;

        const base = template?.timings?.[dayKey]?.[rule.prayer];
        if (!base) continue;

        const azan = addMinutes(base, rule.auto?.azan_offset_minutes || 0);
        const iqaamat = addMinutes(
          base,
          rule.auto?.iqaamat_offset_minutes || 0
        );

        rule.lastComputed = {
          azan,
          iqaamat,
          syncedAt: new Date(),
        };
      }

      await config.save();
    }
  }

  // 🔥 FINAL STEP — reuse your existing resolver
  return resolvePrayerTimings({ config });
}

/* ---------------- HELPER ---------------- */
function addMinutes(time, mins) {
  if (!time) return "";

  const [hh, mm, ap] = time.split(/[: ]/);
  let h = Number(hh);
  let m = Number(mm) + Number(mins || 0);

  h += Math.floor(m / 60);
  m %= 60;

  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}
