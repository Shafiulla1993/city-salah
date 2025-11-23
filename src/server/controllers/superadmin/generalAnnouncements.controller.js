// src/server/controllers/superadmin/generalAnnouncements.controller.js
import mongoose from "mongoose";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";
import City from "@/models/City";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";
import { paginate } from "@/server/utils/paginate";

/**
 * Helper: validate arrays of ids and ensure they exist
 */
async function validateIds(list = [], Model, modelName) {
  if (!list || !list.length) return [];
  const ids = list.map((i) => (typeof i === "string" ? i : String(i)));
  const valid = await Model.find({ _id: { $in: ids } }).select("_id").lean();
  const validIds = valid.map((v) => String(v._id));
  const invalid = ids.filter((i) => !validIds.includes(i));
  if (invalid.length) {
    throw new Error(`Invalid ${modelName} ids: ${invalid.join(", ")}`);
  }
  return ids;
}

/**
 * Create announcement
 * body: { title, body, cities:[], areas:[], masjids:[], startDate, endDate, images:[] }
 */
export async function createGeneralAnnouncementController({ body = {}, user }) {
  try {
    const { title, body: content, cities, areas, masjids, startDate, endDate, images } = body;

    if (!title) return { status: 400, json: { success: false, message: "Title is required" } };
    if (!content) return { status: 400, json: { success: false, message: "Body is required" } };
    if (!startDate || !endDate)
      return { status: 400, json: { success: false, message: "startDate and endDate are required" } };

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()))
      return { status: 400, json: { success: false, message: "Invalid startDate or endDate" } };
    if (s > e) return { status: 400, json: { success: false, message: "startDate must be <= endDate" } };

    // Validate target ids (if provided)
    const citiesIds = cities && cities.length ? await validateIds(cities, City, "city") : [];
    const areasIds = areas && areas.length ? await validateIds(areas, Area, "area") : [];
    const masjidsIds = masjids && masjids.length ? await validateIds(masjids, Masjid, "masjid") : [];

    const doc = await GeneralAnnouncement.create({
      title,
      body: content,
      cities: citiesIds,
      areas: areasIds,
      masjids: masjidsIds,
      images: Array.isArray(images) ? images : images ? [images] : [],
      startDate: s,
      endDate: e,
      createdBy: user?._id,
    });

    return { status: 201, json: { success: true, message: "Announcement created", data: doc } };
  } catch (err) {
    console.error("createGeneralAnnouncementController:", err);
    return { status: 400, json: { success: false, message: err.message || "Create failed" } };
  }
}

/**
 * Get announcements (admin) - paginated & filterable
 * query may include page, limit, search, activeOnly, cityId, areaId, masjidId, startDate, endDate
 */
export async function getGeneralAnnouncementsController({ query } = {}) {
  try {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const search = query?.search;
    const activeOnly = query?.activeOnly === "true" || query?.activeOnly === true;
    const cityId = query?.cityId;
    const areaId = query?.areaId;
    const masjidId = query?.masjidId;

    const filter = {};

    if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { body: { $regex: search, $options: "i" } }];

    // If filtering by target, we want announcements that target that entity OR are global (no targets)
    const targetFilters = [];
    if (cityId && mongoose.isValidObjectId(cityId)) targetFilters.push({ cities: cityId });
    if (areaId && mongoose.isValidObjectId(areaId)) targetFilters.push({ areas: areaId });
    if (masjidId && mongoose.isValidObjectId(masjidId)) targetFilters.push({ masjids: masjidId });

    if (targetFilters.length) {
      // Also include global announcements (no targets) to show universal notices
      filter.$or = [{ cities: { $size: 0 } }, { areas: { $size: 0 } }, { masjids: { $size: 0 } }, ...targetFilters];
    }

    // Date window filters
    if (query?.startDate || query?.endDate) {
      const s = query?.startDate ? new Date(query.startDate) : null;
      const e = query?.endDate ? new Date(query.endDate) : null;
      if (s && e) {
        filter.$and = [{ startDate: { $lte: e } }, { endDate: { $gte: s } }];
      } else if (s) {
        filter.endDate = { $gte: s };
      } else if (e) {
        filter.startDate = { $lte: e };
      }
    }

    // activeOnly (admin can request active)
    if (activeOnly) {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    const result = await paginate(GeneralAnnouncement, {
      page,
      limit,
      filter,
      sort: { startDate: -1, createdAt: -1 },
      populate: [{ path: "createdBy", select: "name email" }],
    });

    return { status: 200, json: { success: true, ...result } };
  } catch (err) {
    console.error("getGeneralAnnouncementsController:", err);
    return { status: 500, json: { success: false, message: "Server error", error: err.message } };
  }
}

/**
 * Get single announcement
 */
export async function getGeneralAnnouncementController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id)) return { status: 400, json: { success: false, message: "Invalid id" } };
    const ann = await GeneralAnnouncement.findById(id).populate("createdBy");
    if (!ann) return { status: 404, json: { success: false, message: "Not found" } };

    // compute active flag
    const now = new Date();
    const isActive = ann.startDate <= now && ann.endDate >= now;
    const data = ann.toObject();
    data.active = isActive;

    return { status: 200, json: { success: true, data } };
  } catch (err) {
    console.error("getGeneralAnnouncementController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * Update announcement
 */
export async function updateGeneralAnnouncementController({ id, body = {}, user }) {
  try {
    if (!mongoose.isValidObjectId(id)) return { status: 400, json: { success: false, message: "Invalid id" } };
    const ann = await GeneralAnnouncement.findById(id);
    if (!ann) return { status: 404, json: { success: false, message: "Not found" } };

    const { title, body: content, cities, areas, masjids, startDate, endDate, images, active } = body;

    if (title !== undefined) ann.title = title;
    if (content !== undefined) ann.body = content;

    if (startDate !== undefined) {
      const s = new Date(startDate);
      if (isNaN(s.getTime())) return { status: 400, json: { success: false, message: "Invalid startDate" } };
      ann.startDate = s;
    }
    if (endDate !== undefined) {
      const e = new Date(endDate);
      if (isNaN(e.getTime())) return { status: 400, json: { success: false, message: "Invalid endDate" } };
      ann.endDate = e;
    }
    if (ann.startDate && ann.endDate && ann.startDate > ann.endDate)
      return { status: 400, json: { success: false, message: "startDate must be <= endDate" } };

    if (cities !== undefined) {
      ann.cities = cities && cities.length ? await validateIds(cities, City, "city") : [];
    }
    if (areas !== undefined) {
      ann.areas = areas && areas.length ? await validateIds(areas, Area, "area") : [];
    }
    if (masjids !== undefined) {
      ann.masjids = masjids && masjids.length ? await validateIds(masjids, Masjid, "masjid") : [];
    }

    if (images !== undefined) ann.images = Array.isArray(images) ? images : images ? [images] : [];

    if (active !== undefined) ann.active = Boolean(active);

    ann.updatedBy = user?._id;
    ann.updatedAt = new Date();

    await ann.save();

    return { status: 200, json: { success: true, message: "Updated", data: ann } };
  } catch (err) {
    console.error("updateGeneralAnnouncementController:", err);
    return { status: 400, json: { success: false, message: err.message || "Update failed" } };
  }
}

/**
 * Delete announcement (hard delete)
 */
export async function deleteGeneralAnnouncementController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id)) return { status: 400, json: { success: false, message: "Invalid id" } };
    await GeneralAnnouncement.findByIdAndDelete(id);
    return { status: 200, json: { success: true, message: "Deleted" } };
  } catch (err) {
    console.error("deleteGeneralAnnouncementController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}
