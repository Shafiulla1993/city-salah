// src/server/services/resolveMasjidTimings.js

import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { resolvePrayerTimings } from "./prayerResolver";

/**
 * IMPORTANT:
 * - Auto prayers (Maghrib) are synced ONLY via sync API
 * - This resolver MUST NOT recompute timings
 */
export async function resolveMasjidTimings({ masjidId }) {
  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId });
  if (!config) return {};

  // 🔥 Just resolve what is already stored
  return resolvePrayerTimings({ config });
}
