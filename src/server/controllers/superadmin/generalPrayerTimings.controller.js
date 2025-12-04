import mongoose from "mongoose";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import GeneralTimingTemplate from "@/models/GeneralTimingTemplate";
import City from "@/models/City";
import Area from "@/models/Area";
import { paginate } from "@/server/utils/paginate";
import { parseCsvFile } from "@/server/utils/parseCsvFile";
import GeneralTimingMapping from "@/models/GeneralTimingMapping";

/**
 * Convert time string with HH:MM AM/PM → minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (typeof timeStr === "number") return timeStr; // Already minutes, return as is
  if (!timeStr || typeof timeStr !== "string") return null;

  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) return null;

  let [_, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);

  if (period.toUpperCase() === "PM" && h !== 12) h += 12;
  if (period.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

/**
 * Normalize slots object into array with { name, time (minutes) }
 */
function normalizeSlots(slotsArray = []) {
  return slotsArray
    .map(({ name, time }) => {
      const minutes = parseTimeToMinutes(time);
      if (minutes === null || isNaN(minutes)) return null;
      return { name, time: minutes };
    })
    .filter(Boolean);
}

/* --------------------------------------------------------------------------
 * GET all templates (paginated)
 * -------------------------------------------------------------------------- */
export async function getAllTemplatesController({ query } = {}) {
  try {
    const { page, limit, search } = query || {};
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const result = await paginate(GeneralTimingTemplate, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
    });

    return result;
  } catch (err) {
    console.error("getAllTemplatesController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * GET single template
 * -------------------------------------------------------------------------- */
export async function getTemplateController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid ID" } };

    const tpl = await GeneralTimingTemplate.findById(id);
    if (!tpl)
      return {
        status: 404,
        json: { success: false, message: "Template not found" },
      };

    return { status: 200, json: { success: true, data: tpl } };
  } catch (err) {
    console.error("getTemplateController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * CREATE template
 * -------------------------------------------------------------------------- */
export async function createTemplateController({ body = {}, user }) {
  try {
    if (!body.name)
      return {
        status: 400,
        json: { success: false, message: "Name required" },
      };

    const exists = await GeneralTimingTemplate.findOne({ name: body.name });
    if (exists)
      return {
        status: 400,
        json: { success: false, message: "Template name already exists" },
      };

    const tpl = await GeneralTimingTemplate.create({
      ...body,
      createdBy: user?._id,
    });

    return {
      status: 201,
      json: { success: true, message: "Template created", data: tpl },
    };
  } catch (err) {
    console.error("createTemplateController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * UPDATE template
 * -------------------------------------------------------------------------- */
export async function updateTemplateController({ id, body = {} }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid ID" } };

    const tpl = await GeneralTimingTemplate.findById(id);
    if (!tpl)
      return {
        status: 404,
        json: { success: false, message: "Template not found" },
      };

    if (body.name && body.name !== tpl.name) {
      const exists = await GeneralTimingTemplate.findOne({
        name: body.name,
        _id: { $ne: id },
      });
      if (exists)
        return {
          status: 400,
          json: { success: false, message: "Name already taken" },
        };
    }

    Object.assign(tpl, body, { updatedAt: new Date() });
    await tpl.save();

    return {
      status: 200,
      json: { success: true, message: "Template updated", data: tpl },
    };
  } catch (err) {
    console.error("updateTemplateController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * LIST general timings by date range
 * query: cityId (required), areaId?, start?, end?
 * If no start/end → default to current month
 * -------------------------------------------------------------------------- */
export async function listGeneralTimingsController({ query }) {
  try {
    const { cityId, areaId, start, end } = query || {};

    if (!cityId) {
      return {
        status: 400,
        json: { success: false, message: "cityId is required" },
      };
    }

    const filter = { city: cityId };

    if (areaId) {
      filter.area = areaId;
    }

    // If start & end provided, filter by date range
    if (start && end) {
      filter.date = { $gte: start, $lte: end };
    }

    const timings = await GeneralPrayerTiming.find(filter)
      .populate("city", "name")
      .populate("area", "name")
      .sort({ date: 1 });

    return {
      status: 200,
      json: { success: true, data: timings },
    };
  } catch (err) {
    console.error("listGeneralTimingsController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * DELETE template
 * -------------------------------------------------------------------------- */
export async function deleteTemplateController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid ID" } };

    await GeneralTimingTemplate.findByIdAndDelete(id);
    return {
      status: 200,
      json: { success: true, message: "Template deleted" },
    };
  } catch (err) {
    console.error("deleteTemplateController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * CSV upload → merge into template
 * -------------------------------------------------------------------------- */
export async function uploadCsvToTemplateController({
  filepath,
  fields,
  user,
}) {
  try {
    if (!fields.name)
      return {
        status: 400,
        json: { success: false, message: "Template name missing" },
      };

    let tpl = await GeneralTimingTemplate.findOne({ name: fields.name });

    const rows = await parseCsvFile(filepath);
    if (!rows?.length)
      return { status: 400, json: { success: false, message: "CSV is empty" } };

    const dates = {};
    rows.forEach((r) => {
      const date = r.date;
      delete r.date;
      dates[date] = normalizeSlots(r);
    });

    if (!tpl) {
      tpl = await GeneralTimingTemplate.create({
        name: fields.name,
        dates,
        createdBy: user?._id,
      });
    } else {
      tpl.dates = { ...tpl.dates, ...dates };
      tpl.updatedAt = new Date();
      tpl.updatedBy = user?._id;
      await tpl.save();
    }

    return {
      status: 200,
      json: { success: true, message: "CSV imported", data: tpl },
    };
  } catch (err) {
    console.error("uploadCsvToTemplateController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * GET general timing by date (for auto copy yesterday)
 * query: cityId, areaId, date
 * -------------------------------------------------------------------------- */
export async function getTimingByDateController({ query }) {
  try {
    const { cityId, areaId, date } = query || {};
    if (!cityId || !date)
      return {
        status: 400,
        json: { success: false, message: "cityId & date required" },
      };

    const filter = { city: cityId, date };
    if (areaId && areaId !== "") filter.area = areaId;

    const timing = await GeneralPrayerTiming.findOne(filter);
    return { status: 200, json: { success: true, data: timing || null } };
  } catch (err) {
    console.error("getTimingByDateController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 * CREATE manual general timing entry
 * -------------------------------------------------------------------------- */
export async function createManualTimingController({ body = {}, user }) {
  try {
    const { city, area, date, slots } = body;

    if (!city || !date) {
      return {
        status: 400,
        json: { success: false, message: "city & date required" },
      };
    }

    const formatted = normalizeSlots(slots || []);
    if (!formatted.length) {
      return {
        status: 400,
        json: { success: false, message: "No timings provided" },
      };
    }

    const query = { city, date };
    if (area) query.area = area;

    let timing = await GeneralPrayerTiming.findOne(query);

    if (!timing) {
      timing = await GeneralPrayerTiming.create({
        city,
        area: area || null,
        date,
        source: "manual",
        slots: formatted,
        createdBy: user?._id,
      });
    } else {
      timing.slots = formatted;
      timing.source = "manual";
      timing.updatedBy = user?._id;
      timing.updatedAt = new Date();
      await timing.save();
    }

    return {
      status: 200,
      json: { success: true, message: "Timing saved", data: timing },
    };
  } catch (err) {
    console.error("createManualTimingController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* --------------------------------------------------------------------------
 *  MAPPINGS — template assigned to city/area
 * -------------------------------------------------------------------------- */

/**
 * GET all mappings
 */
export async function getMappingsController() {
  try {
    const mappings = await GeneralTimingMapping.find()
      .populate("template", "name")
      .populate("city", "name")
      .populate("area", "name")
      .sort({ createdAt: -1 });

    return { status: 200, json: { success: true, data: mappings } };
  } catch (err) {
    console.error("getMappingsController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/**
 * CREATE mapping
 * body: { template, city?, area? }
 * rules:
 *   - area mapping overrides city mapping
 *   - one city can have only 1 mapping (unless area-specific exists)
 */
export async function createMappingController({ body = {}, user }) {
  try {
    const { template, city, area } = body;

    if (!template)
      return {
        status: 400,
        json: { success: false, message: "Template required" },
      };

    if (!city)
      return {
        status: 400,
        json: { success: false, message: "City is required" },
      };

    const scope = area ? "area" : "city";

    /**
     * RULES:
     * - If area is selected → unique per area
     * - If area is not selected → unique per city (city-level)
     */

    if (scope === "area") {
      const exists = await GeneralTimingMapping.findOne({
        area,
      });

      if (exists)
        return {
          status: 400,
          json: { success: false, message: "This area already has a mapping" },
        };
    }

    if (scope === "city") {
      const exists = await GeneralTimingMapping.findOne({
        city,
        area: null, // important fix
      });

      if (exists)
        return {
          status: 400,
          json: {
            success: false,
            message: "This city already has a city-level mapping",
          },
        };
    }

    const map = await GeneralTimingMapping.create({
      template,
      city,
      area: area || null,
      scope,
      createdBy: user?._id,
    });

    return {
      status: 201,
      json: { success: true, message: "Mapping created", data: map },
    };
  } catch (err) {
    console.error("createMappingController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/**
 * DELETE mapping
 */
export async function deleteMappingController({ id }) {
  try {
    await GeneralTimingMapping.findByIdAndDelete(id);
    return { status: 200, json: { success: true, message: "Mapping deleted" } };
  } catch (err) {
    console.error("deleteMappingController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}
