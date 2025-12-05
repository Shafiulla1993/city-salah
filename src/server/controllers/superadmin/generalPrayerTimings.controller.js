// src/server/controllers/superadmin/generalPrayerTimings.controller.js

import mongoose from "mongoose";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import GeneralTimingTemplate from "@/models/GeneralTimingTemplate";
import { paginate } from "@/server/utils/paginate";
import { parseCsvFile } from "@/server/utils/parseCsvFile";
import GeneralTimingMapping from "@/models/GeneralTimingMapping";

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

/** Convert `5:27 AM` → minutes */
export function parseTimeToMinutes(str) {
  if (typeof str === "number") return str;
  if (!str || typeof str !== "string") return null;

  const match = str.trim().match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) return null;

  let [, h, m, p] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);

  if (p.toUpperCase() === "PM" && h !== 12) h += 12;
  if (p.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

/** Convert slot object → { name, time }[] */
function normalizeSlots(obj) {
  const slots = [];
  for (const name in obj) {
    const time = parseTimeToMinutes(obj[name]);
    if (time !== null) slots.push({ name, time });
  }
  return slots;
}

/* -------------------------------------------------------------------------- */
/*  TEMPLATES                                                                  */
/* -------------------------------------------------------------------------- */

export async function getAllTemplatesController({ query } = {}) {
  try {
    const { page, limit, search } = query || {};
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    return await paginate(GeneralTimingTemplate, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
    });
  } catch (err) {
    return { status: 500, json: { success: false, message: err.message } };
  }
}

export async function getTemplateController({ id }) {
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  const tpl = await GeneralTimingTemplate.findById(id);
  if (!tpl)
    return {
      status: 404,
      json: { success: false, message: "Template not found" },
    };

  return { status: 200, json: { success: true, data: tpl } };
}

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
    return { status: 500, json: { success: false, message: err.message } };
  }
}

export async function updateTemplateController({ id, body = {} }) {
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
}

export async function deleteTemplateController({ id }) {
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  await GeneralTimingTemplate.findByIdAndDelete(id);
  return { status: 200, json: { success: true, message: "Template deleted" } };
}

/* -------------------------------------------------------------------------- */
/*  CSV IMPORT                                                                 */
/* -------------------------------------------------------------------------- */

export async function uploadCsvToTemplateController({
  filepath,
  fields,
  csvText,
  user,
}) {
  try {
    const name = fields?.name?.trim();
    if (!name)
      return {
        status: 400,
        json: { success: false, message: "Template name missing" },
      };

    let rows = [];

    if (filepath) {
      rows = await parseCsvFile(filepath);
    } else if (csvText) {
      const { parse } = await import("csv-parse/sync");
      rows = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    }

    if (!rows || !rows.length)
      return {
        status: 400,
        json: { success: false, message: "CSV empty or unreadable" },
      };

    const days = rows
      .map((r) => {
        const dateKey = r.date;
        delete r.date;
        if (!dateKey) return null;
        const slots = normalizeSlots(r);
        return { dateKey, slots };
      })
      .filter(Boolean);

    let tpl = await GeneralTimingTemplate.findOne({ name });

    if (!tpl) {
      tpl = await GeneralTimingTemplate.create({
        name,
        timezone: fields.timezone || "Asia/Kolkata",
        recurrence: "recurring",
        days,
        createdBy: user?._id,
      });
    } else {
      // merge or overwrite days on same dateKey
      const map = new Map(tpl.days.map((d) => [d.dateKey, d]));
      days.forEach((d) => map.set(d.dateKey, d));
      tpl.days = Array.from(map.values());
      tpl.updatedBy = user?._id;
      tpl.updatedAt = new Date();
      await tpl.save();
    }

    return {
      status: 200,
      json: { success: true, message: "CSV imported", data: tpl },
    };
  } catch (err) {
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* -------------------------------------------------------------------------- */
/*  GENERAL PRAYER TIMINGS (CSV + Manual Fallback)                             */
/* -------------------------------------------------------------------------- */

export async function listGeneralTimingsController({ query }) {
  try {
    const { cityId, areaId, start, end } = query || {};
    if (!cityId)
      return {
        status: 400,
        json: { success: false, message: "cityId is required" },
      };

    /* ---------------------------------- STEP 1 --------------------------------- */
    /* Try to fetch from manual/general timings DB first                           */
    const filter = { city: cityId };
    if (areaId) filter.area = areaId;
    if (start && end) filter.date = { $gte: start, $lte: end };

    const manual = await GeneralPrayerTiming.find(filter)
      .populate("city", "name")
      .populate("area", "name")
      .sort({ date: 1 });

    if (manual.length > 0) {
      return {
        status: 200,
        json: { success: true, source: "manual", data: manual },
      };
    }

    /* ---------------------------------- STEP 2 --------------------------------- */
    /* If manual not found → fallback to template via mapping                      */
    const mapping = await GeneralTimingMapping.findOne({
      city: cityId,
      area: areaId || null,
    });
    if (!mapping) return { status: 200, json: { success: true, data: [] } };

    const template = await GeneralTimingTemplate.findById(mapping.template);
    if (!template || !template.days)
      return { status: 200, json: { success: true, data: [] } };

    /* Convert template.dateKey -> YYYY-MM-DD */
    const results = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    template.days.forEach((d) => {
      // dateKey example: "1-Dec"
      const [day, mon] = d.dateKey.split("-");
      const actualDate = new Date(
        startDate.getFullYear(),
        monthIndex(mon),
        parseInt(day)
      );

      if (actualDate >= startDate && actualDate <= endDate) {
        results.push({
          _id: `${mapping._id}-${d.dateKey}`, // virtual ID
          city: cityId,
          area: areaId || null,
          date: actualDate.toISOString().slice(0, 10),
          slots: d.slots,
          source: "template",
        });
      }
    });

    return {
      status: 200,
      json: { success: true, source: "template", data: results },
    };
  } catch (err) {
    console.error("listGeneralTimingsController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/* Helper to convert "Dec" -> 11 */
function monthIndex(mon) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(mon);
}

export async function getTimingByDateController({ query }) {
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
}

export async function createManualTimingController({ body = {}, user }) {
  const { city, area, date, slots } = body;
  if (!city || !date)
    return {
      status: 400,
      json: { success: false, message: "city & date required" },
    };

  const formatted = normalizeSlots(slots || []);
  if (!formatted.length)
    return {
      status: 400,
      json: { success: false, message: "No timings provided" },
    };

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
}

/* -------------------------------------------------------------------------- */
/*  MAPPINGS                                                                   */
/* -------------------------------------------------------------------------- */

export async function getMappingsController() {
  const mappings = await GeneralTimingMapping.find()
    .populate("template", "name")
    .populate("city", "name")
    .populate("area", "name")
    .sort({ createdAt: -1 });

  return { status: 200, json: { success: true, data: mappings } };
}

export async function createMappingController({ body = {}, user }) {
  const { template, city, area } = body;
  if (!template)
    return {
      status: 400,
      json: { success: false, message: "Template required" },
    };
  if (!city)
    return { status: 400, json: { success: false, message: "City required" } };

  const scope = area ? "area" : "city";

  if (scope === "area") {
    const exists = await GeneralTimingMapping.findOne({ area });
    if (exists)
      return {
        status: 400,
        json: { success: false, message: "This area already has mapping" },
      };
  } else {
    const exists = await GeneralTimingMapping.findOne({ city, area: null });
    if (exists)
      return {
        status: 400,
        json: {
          success: false,
          message: "City already has city-level mapping",
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
}

export async function deleteMappingController({ id }) {
  await GeneralTimingMapping.findByIdAndDelete(id);
  return { status: 200, json: { success: true, message: "Mapping deleted" } };
}
