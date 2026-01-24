//  src/server/services/getTodayMaghribFromDayKey.js

import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import City from "@/models/City";
import Area from "@/models/Area";

function getTodayDayKey() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export async function getTodayMaghribFromDayKey(citySlug, areaSlug) {
  const city = await City.findOne({ slug: citySlug });
  if (!city) return null;

  let area = null;
  if (areaSlug) {
    area = await Area.findOne({ slug: areaSlug, city: city._id });
  }

  const dayKey = getTodayDayKey();

  let timing = null;

  if (area) {
    timing = await GeneralPrayerTiming.findOne({
      city: city._id,
      area: area._id,
      dayKey,
    }).lean();
  }

  if (!timing) {
    timing = await GeneralPrayerTiming.findOne({
      city: city._id,
      area: null,
      dayKey,
    }).lean();
  }

  if (!timing) return null;

  const maghribSlot = timing.slots.find((s) => s.name === "maghrib_start");
  return maghribSlot?.time ?? null; // minutes from midnight
}
