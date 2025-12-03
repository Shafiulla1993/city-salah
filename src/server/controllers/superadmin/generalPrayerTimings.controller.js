// src/server/controllers/superadmin/generalPrayerTimings.controller.js

import mongoose from "mongoose";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import GeneralTimingTemplate from "@/models/GeneralTimingTemplate";
import City from "@/models/City";
import Area from "@/models/Area";
import { paginate } from "@/server/utils/paginate";
import { parseCsvFile } from "@/server/utils/parseCsvFile"; // you'll add parser here

/**
 * Convert slot object with HH:MM AM/PM → minutes from midnight
 */
function parseTimeToMinutes(str) {
  if (!str || typeof str !== "string") return null;
  const match = str.trim().match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) return null;
  let [_, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period.toUpperCase() === "PM" && h !== 12) h += 12;
  if (period.toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function normalizeSlots(slotsObj = {}) {
  return Object.keys(slotsObj).map((name) => ({
    name,
    time: parseTimeToMinutes(slotsObj[name]) ?? null,
  }));
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
    if (areaId) filter.area = areaId;

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

    if (!city || !area || !date)
      return {
        status: 400,
        json: { success: false, message: "city, area, date are required" },
      };

    const formatted = normalizeSlots(slots || {});
    if (!formatted.length)
      return {
        status: 400,
        json: { success: false, message: "No timings provided" },
      };

    let timing = await GeneralPrayerTiming.findOne({ city, area, date });

    if (!timing) {
      timing = await GeneralPrayerTiming.create({
        city,
        area,
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
import GeneralTimingMapping from "@/models/GeneralTimingMapping";

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

    if (!city && !area)
      return {
        status: 400,
        json: { success: false, message: "Provide city or area" },
      };

    // area mapping uniqueness
    if (area) {
      const exists = await GeneralTimingMapping.findOne({ area });
      if (exists)
        return {
          status: 400,
          json: { success: false, message: "Area already mapped" },
        };
    }

    // city mapping uniqueness
    if (city && !area) {
      const exists = await GeneralTimingMapping.findOne({
        city,
        area: { $exists: false },
      });
      if (exists)
        return {
          status: 400,
          json: { success: false, message: "City already mapped" },
        };
    }

    const map = await GeneralTimingMapping.create({
      template,
      city,
      area,
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
