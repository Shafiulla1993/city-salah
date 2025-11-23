import mongoose from "mongoose";
import ThoughtOfDay from "@/models/ThoughtOfDay";
import { paginate } from "@/server/utils/paginate";

/**
 * ADMIN — Paginated list of all thoughts
 */
export async function getThoughtsController({ query = {} }) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      activeOnly,
      startDate,
      endDate
    } = query;

    const filter = {};

    if (search) {
      filter.text = { $regex: search, $options: "i" };
    }

    // date-range filter for admin
    if (startDate || endDate) {
      const s = startDate ? new Date(startDate) : null;
      const e = endDate ? new Date(endDate) : null;

      filter.$and = [];
      if (s) filter.$and.push({ endDate: { $gte: s } });
      if (e) filter.$and.push({ startDate: { $lte: e } });

      if (filter.$and.length === 0) delete filter.$and;
    }

    // Only active thoughts (optional for admin)
    if (activeOnly === "true") {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    const result = await paginate(ThoughtOfDay, {
      page,
      limit,
      filter,
      sort: { startDate: -1 },
      populate: { path: "createdBy", select: "name email" }
    });

    return { status: 200, json: { success: true, ...result } };
  } catch (err) {
    console.error("getThoughtsController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * PUBLIC — Return single active thought
 */
export async function getActiveThoughtController() {
  try {
    const now = new Date();

    const thought = await ThoughtOfDay.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .sort({ startDate: -1 }) // latest starting wins
      .lean();

    return {
      status: 200,
      json: { success: true, data: thought || null }
    };
  } catch (err) {
    console.error("getActiveThoughtController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * GET one thought
 */
export async function getThoughtController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid ID" } };

    const thought = await ThoughtOfDay.findById(id);
    if (!thought)
      return { status: 404, json: { success: false, message: "Not found" } };

    return { status: 200, json: { success: true, data: thought } };
  } catch {
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * CREATE
 */
export async function createThoughtController({ body, user }) {
  try {
    const { text, startDate, endDate, images } = body;

    if (!text) return { status: 400, json: { success: false, message: "Text required" } };
    if (!startDate) return { status: 400, json: { success: false, message: "startDate required" } };
    if (!endDate) return { status: 400, json: { success: false, message: "endDate required" } };

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (s > e) {
      return { status: 400, json: { success: false, message: "startDate must be <= endDate" } };
    }

    const doc = await ThoughtOfDay.create({
      text,
      images: Array.isArray(images) ? images : images ? [images] : [],
      startDate: s,
      endDate: e,
      createdBy: user._id
    });

    return { status: 201, json: { success: true, message: "Created", data: doc } };
  } catch (err) {
    console.error("createThought:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * UPDATE
 */
export async function updateThoughtController({ id, body, user }) {
  try {
    const thought = await ThoughtOfDay.findById(id);
    if (!thought) return { status: 404, json: { success: false, message: "Not found" } };

    const { text, startDate, endDate, images } = body;

    if (text !== undefined) thought.text = text;

    if (startDate) {
      const s = new Date(startDate);
      if (isNaN(s)) return { status: 400, json: { success: false, message: "Invalid startDate" } };
      thought.startDate = s;
    }

    if (endDate) {
      const e = new Date(endDate);
      if (isNaN(e)) return { status: 400, json: { success: false, message: "Invalid endDate" } };
      thought.endDate = e;
    }

    if (thought.startDate > thought.endDate) {
      return { status: 400, json: { success: false, message: "startDate must be <= endDate" } };
    }

    if (images !== undefined) {
      thought.images = Array.isArray(images) ? images : [images];
    }

    thought.updatedBy = user._id;
    thought.updatedAt = new Date();
    await thought.save();

    return { status: 200, json: { success: true, message: "Updated", data: thought } };
  } catch (err) {
    console.error("updateThought:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * DELETE
 */
export async function deleteThoughtController({ id }) {
  try {
    await ThoughtOfDay.findByIdAndDelete(id);
    return { status: 200, json: { success: true, message: "Deleted" } };
  } catch {
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}
