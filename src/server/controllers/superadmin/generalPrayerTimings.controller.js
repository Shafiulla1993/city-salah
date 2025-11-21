// src/server/controllers/superadmin/generalPrayerTimings.controller.js

import Area from "@/models/Area";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import { generateBothMadhabs, generatePrayerTimes } from "@/lib/helpers/prayerTimeHelper";

export async function generateDailyTimingsController({ body, user }) {
  const { cityId, areaId, offsets = {} } = body;

  const query = {};
  if (areaId) query._id = areaId;
  if (cityId) query.city = cityId;

  const areas = await Area.find(query).populate("city");
  if (!areas.length) {
    return {
      status: 404,
      json: { message: "No areas found for given filters" },
    };
  }

  const results = [];

  for (const area of areas) {
    const { center, city } = area;
    if (!center?.coordinates) continue;

    const coords = {
      latitude: center.coordinates[1],
      longitude: center.coordinates[0],
      timezone: city.timezone || "Asia/Kolkata",
      offsets,
    };

    // ⬅ Get Shafi + Hanafi timings
    const { shafi, hanafi } = generateBothMadhabs(coords);

    const madhabs = { shafi, hanafi };

    for (const [madhab, data] of Object.entries(madhabs)) {
      // Remove already existing for today
      await GeneralPrayerTiming.deleteMany({
        area: area._id,
        date: data.date,
        madhab,
      });

      const newTiming = await GeneralPrayerTiming.create({
        area: area._id,
        city: city._id,
        date: data.date,
        prayers: data.prayers,
        madhab,
        type: "date",
        createdBy: user._id,
      });

      results.push(newTiming);
    }
  }

  return {
    status: 201,
    json: {
      message: `Generated ${results.length} prayer timing records successfully.`,
      data: results,
    },
  };
}


export async function getAllTimingsController({ query }) {
  const { cityId, areaId, date } = query || {};

  const filter = {};
  if (cityId) filter.city = cityId;
  if (areaId) filter.area = areaId;
  if (date) filter.date = date;

  const timings = await GeneralPrayerTiming.find(filter)
    .populate("city", "name")
    .populate("area", "name")
    .sort({ date: -1, madhab: 1 });

  return { status: 200, json: timings };
}


export async function updateOffsetsController({ body }) {
  const { areaId, madhab, offsets } = body;

  if (!areaId || !madhab) {
    return { status: 400, json: { message: "areaId and madhab are required" } };
  }

  const area = await Area.findById(areaId).populate("city");
  if (!area) {
    return { status: 404, json: { message: "Area not found" } };
  }

  const coords = {
    latitude: area.center.coordinates[1],
    longitude: area.center.coordinates[0],
    timezone: area.city.timezone || "Asia/Kolkata",
    madhab,
    offsets,
  };

  // Generate updated timing for selected madhab
  const { prayers, date } = generatePrayerTimes(coords);

  const updated = await GeneralPrayerTiming.findOneAndUpdate(
    { area: area._id, date, madhab },
    { prayers },
    { new: true }
  );

  if (!updated) {
    return {
      status: 404,
      json: { message: "No existing record for today" },
    };
  }

  return {
    status: 200,
    json: { message: "Offsets applied successfully", data: updated },
  };
}
