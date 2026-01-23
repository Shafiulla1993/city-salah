// src/server/services/resolveMasjidTimings.js

import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { resolvePrayerTimings } from "./prayerResolver";

/**
 * FINAL LOCK:
 * - No recompute
 * - No general timing math
 * - Only return stored + synced values
 */
export async function resolveMasjidTimings({ masjidId }) {
  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId }).lean();
  if (!config) return {};

  return resolvePrayerTimings({ config });
}
