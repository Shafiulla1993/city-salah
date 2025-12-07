// src/server/controllers/superadmin/generalAnnouncements.controller.js
import mongoose from "mongoose";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";
import City from "@/models/City";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";
import { paginate } from "@/server/utils/paginate";

/* Normalizes ANY format to clean string array */
function normalizeIds(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {}
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

/* Validates and filters only existing ids */
async function validateIds(raw, Model, modelName) {
  const ids = normalizeIds(raw);
  if (!ids.length) return [];
  const validDocs = await Model.find({ _id: { $in: ids } })
    .select("_id")
    .lean();
  const validIds = validDocs.map((d) => String(d._id));
  const invalid = ids.filter((i) => !validIds.includes(i));
  if (invalid.length)
    throw new Error(`Invalid ${modelName} ids: ${invalid.join(", ")}`);
  return validIds;
}

/* CREATE */
export async function createGeneralAnnouncementController({ body = {}, user }) {
  try {
    const {
      title,
      body: content,
      cities,
      areas,
      masjids,
      startDate,
      endDate,
      images,
    } = body;

    if (!title)
      return {
        status: 400,
        json: { success: false, message: "Title is required" },
      };
    if (!content)
      return {
        status: 400,
        json: { success: false, message: "Body is required" },
      };
    if (!startDate || !endDate)
      return {
        status: 400,
        json: { success: false, message: "startDate and endDate are required" },
      };

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e))
      return {
        status: 400,
        json: { success: false, message: "Invalid dates" },
      };
    if (s > e)
      return {
        status: 400,
        json: { success: false, message: "startDate must be <= endDate" },
      };

    const doc = await GeneralAnnouncement.create({
      title,
      body: content,
      cities: await validateIds(cities, City, "city"),
      areas: await validateIds(areas, Area, "area"),
      masjids: await validateIds(masjids, Masjid, "masjid"),
      images: normalizeIds(images),
      startDate: s,
      endDate: e,
      createdBy: user?._id,
    });

    return {
      status: 201,
      json: { success: true, message: "Announcement created", data: doc },
    };
  } catch (err) {
    console.error("createGeneralAnnouncementController:", err);
    return {
      status: 400,
      json: { success: false, message: err.message || "Create failed" },
    };
  }
}

/* PAGINATED LIST */
export async function getGeneralAnnouncementsController({ query } = {}) {
  try {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const filter = {};
    const search = query?.search;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }

    const now = new Date();
    if (query?.activeOnly === "true") {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    const targets = [];
    if (query.cityId && mongoose.isValidObjectId(query.cityId))
      targets.push({ cities: query.cityId });
    if (query.areaId && mongoose.isValidObjectId(query.areaId))
      targets.push({ areas: query.areaId });
    if (query.masjidId && mongoose.isValidObjectId(query.masjidId))
      targets.push({ masjids: query.masjidId });

    if (targets.length) {
      filter.$or = [
        { cities: { $size: 0 } },
        { areas: { $size: 0 } },
        { masjids: { $size: 0 } },
        ...targets,
      ];
    }

    const result = await paginate(GeneralAnnouncement, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
      populate: [{ path: "createdBy", select: "name email" }],
    });

    return { status: 200, json: { success: true, ...result } };
  } catch (err) {
    console.error("getGeneralAnnouncementsController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/* GET SINGLE */
export async function getGeneralAnnouncementController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid id" } };
    const ann = await GeneralAnnouncement.findById(id).populate("createdBy");
    if (!ann)
      return { status: 404, json: { success: false, message: "Not found" } };

    const now = new Date();
    const data = ann.toObject();
    data.active = ann.startDate <= now && ann.endDate >= now;

    return { status: 200, json: { success: true, data } };
  } catch (err) {
    console.error("getGeneralAnnouncementController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/* UPDATE */
export async function updateGeneralAnnouncementController({
  id,
  body = {},
  user,
}) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid id" } };
    const ann = await GeneralAnnouncement.findById(id);
    if (!ann)
      return { status: 404, json: { success: false, message: "Not found" } };

    const {
      title,
      body: content,
      cities,
      areas,
      masjids,
      startDate,
      endDate,
      images,
      active,
    } = body;

    if (title !== undefined) ann.title = title;
    if (content !== undefined) ann.body = content;

    if (startDate !== undefined) ann.startDate = new Date(startDate);
    if (endDate !== undefined) ann.endDate = new Date(endDate);
    if (ann.startDate > ann.endDate)
      return {
        status: 400,
        json: { success: false, message: "startDate must be <= endDate" },
      };

    if (cities !== undefined)
      ann.cities = await validateIds(cities, City, "city");
    if (areas !== undefined) ann.areas = await validateIds(areas, Area, "area");
    if (masjids !== undefined)
      ann.masjids = await validateIds(masjids, Masjid, "masjid");

    if (images !== undefined) ann.images = normalizeIds(images);
    if (active !== undefined) ann.active = Boolean(active);

    ann.updatedBy = user?._id;
    ann.updatedAt = new Date();
    await ann.save();

    return {
      status: 200,
      json: { success: true, message: "Updated", data: ann },
    };
  } catch (err) {
    console.error("updateGeneralAnnouncementController:", err);
    return {
      status: 400,
      json: { success: false, message: err.message || "Update failed" },
    };
  }
}

/* DELETE */
export async function deleteGeneralAnnouncementController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid id" } };
    await GeneralAnnouncement.findByIdAndDelete(id);
    return { status: 200, json: { success: true, message: "Deleted" } };
  } catch (err) {
    console.error("deleteGeneralAnnouncementController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}
