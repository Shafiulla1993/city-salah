// src/server/controllers/superadmin/generalPrayerTimings.controller.js


// -------------------------------------
// GENERAL PRAYER TIMINGS CONTROLLER
// -------------------------------------

import moment from "moment-timezone";
import City from "@/models/City";
import Area from "@/models/Area";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import { generateBothMadhabs, generatePrayerTimes } from "@/lib/helpers/prayerTimeHelper";

const TZ = "Asia/Kolkata";

/**
 * Helper: Format date to YYYY-MM-DD
 */
function fmt(date) {
  return moment(date).tz(TZ).format("YYYY-MM-DD");
}

/**
 * Helper: Loop dates (from → to)
 */
function* dateRange(start, end) {
  let current = moment(start).tz(TZ);
  let last = moment(end).tz(TZ);
  while (current <= last) {
    yield current.format("YYYY-MM-DD");
    current.add(1, "day");
  }
}

/**
 * -------------------------------
 * GENERATE TIMINGS FOR A DATE RANGE
 * -------------------------------
 *
 * Accepts:
 * - cityId? (optional)
 * - areaIds? (optional)
 * - fromDate (required)
 * - toDate (required)
 * - madhabs = ["shafi","hanafi"] (optional)
 * - offsets = {} (optional)
 */
export async function generateTimingsForRange({
  cityId,
  areaIds = [],
  fromDate,
  toDate,
  madhabs = ["shafi", "hanafi"],
  offsets = {},
}) {
  if (!fromDate || !toDate) {
    return { status: 400, json: { message: "fromDate and toDate are required" } };
  }

  // Fetch areas
  const filter = {};
  if (cityId) filter.city = cityId;
  if (areaIds.length) filter._id = { $in: areaIds };

  const areas = await Area.find(filter).populate("city");
  if (!areas.length) {
    return { status: 404, json: { message: "No matching areas found" } };
  }

  const created = [];

  for (const area of areas) {
    const { center, city } = area;

    if (!center?.coordinates) {
      console.warn("Missing coordinates for area:", area.name);
      continue;
    }

    for (const date of dateRange(fromDate, toDate)) {
      for (const madhab of madhabs) {
        const existing = await GeneralPrayerTiming.findOne({
          area: area._id,
          date,
          madhab,
        });

        // Skip existing
        if (existing) continue;

        // Generate timings
        const coords = {
          latitude: center.coordinates[1],
          longitude: center.coordinates[0],
          timezone: city.timezone || TZ,
          offsets,
          madhab,
        };

        const result = generatePrayerTimes(coords);

        const newRecord = await GeneralPrayerTiming.create({
          area: area._id,
          city: city._id,
          date,
          prayers: result.prayers,
          madhab,
          type: "date",
        });

        created.push(newRecord);
      }
    }
  }

  return {
    status: 200,
    json: {
      message: "Prayer timings generated",
      createdCount: created.length,
      data: created,
    },
  };
}

/**
 * -----------------------------------
 * GET ALL TIMINGS (WITH FILTERS)
 * -----------------------------------
 *
 * Supports query:
 * - cityId
 * - areaId
 * - date
 * - fromDate
 * - toDate
 * - madhab
 * - page
 * - limit
 */
export async function getAllTimingsController({ query }) {
  const {
    cityId,
    areaId,
    date,
    fromDate,
    toDate,
    madhab,
    page = 1,
    limit = 50,
  } = query;

  const filter = {};

  if (cityId) filter.city = cityId;
  if (areaId) filter.area = areaId;
  if (madhab) filter.madhab = madhab;

  if (date) {
    filter.date = date;
  } else if (fromDate && toDate) {
    filter.date = { $gte: fromDate, $lte: toDate };
  }

  const skip = (page - 1) * limit;

  const results = await GeneralPrayerTiming.find(filter)
    .populate("city", "name")
    .populate("area", "name")
    .sort({ date: -1, madhab: 1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    status: 200,
    json: {
      page: Number(page),
      limit: Number(limit),
      count: results.length,
      data: results,
    },
  };
}

/**
 * -----------------------------------
 * GET SINGLE TIMING BY ID
 * -----------------------------------
 */
export async function getTimingByIdController({ id }) {
  const timing = await GeneralPrayerTiming.findById(id)
    .populate("city", "name")
    .populate("area", "name");

  if (!timing) {
    return { status: 404, json: { message: "Timing not found" } };
  }

  return { status: 200, json: timing };
}

/**
 * -----------------------------------
 * UPDATE OFFSETS FOR A DAY + MADHAB
 * -----------------------------------
 *
 * Recalculates all prayers for that day.
 */
export async function updateOffsetsController({
  areaId,
  date,
  madhab,
  offsets = {},
  user,
}) {
  if (!areaId || !date || !madhab) {
    return {
      status: 400,
      json: { message: "areaId, date and madhab are required" },
    };
  }

  const area = await Area.findById(areaId).populate("city");
  if (!area) {
    return { status: 404, json: { message: "Area not found" } };
  }

  const timing = await GeneralPrayerTiming.findOne({
    area: areaId,
    date,
    madhab,
  });

  if (!timing) {
    return { status: 404, json: { message: "Timing not found for day" } };
  }

  const coords = {
    latitude: area.center.coordinates[1],
    longitude: area.center.coordinates[0],
    timezone: area.city.timezone || TZ,
    offsets,
    madhab,
  };

  const updated = generatePrayerTimes(coords);

  timing.prayers = updated.prayers;
  timing.updatedAt = new Date();
  timing.updatedBy = user?._id;

  await timing.save();

  return {
    status: 200,
    json: { message: "Offsets updated", data: timing },
  };
}

/**
 * -----------------------------------
 * UPDATE A SPECIFIC PRAYER SLOT
 * -----------------------------------
 */
export async function updateSinglePrayerSlotController({
  id,
  slotName,
  startHHMM,
  endHHMM,
  user,
}) {
  const timing = await GeneralPrayerTiming.findById(id);
  if (!timing) {
    return { status: 404, json: { message: "Timing not found" } };
  }

  const slot = timing.prayers.find((p) => p.name === slotName);
  if (!slot) {
    return { status: 404, json: { message: "Prayer slot not found" } };
  }

  if (startHHMM) slot.startTime = startHHMM;
  if (endHHMM) slot.endTime = endHHMM;

  timing.updatedAt = new Date();
  timing.updatedBy = user?._id;

  await timing.save();

  return {
    status: 200,
    json: { message: "Prayer slot updated", data: timing },
  };
}

/**
 * -----------------------------------
 * DELETE TIMING RECORD
 * -----------------------------------
 */
export async function deleteTimingController({ id }) {
  await GeneralPrayerTiming.findByIdAndDelete(id);
  return { status: 200, json: { message: "Timing deleted" } };
}
