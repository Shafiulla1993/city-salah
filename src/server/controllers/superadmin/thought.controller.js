// src/server/controllers/superadmin/thought.controller.js

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
      endDate,
    } = query;

    const filter = {};

    if (search) {
      filter.text = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      const s = startDate ? new Date(startDate) : null;
      const e = endDate ? new Date(endDate) : null;
      filter.$and = [];
      if (s) filter.$and.push({ endDate: { $gte: s } });
      if (e) filter.$and.push({ startDate: { $lte: e } });
      if (!filter.$and.length) delete filter.$and;
    }

    if (activeOnly === "true") {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    const result = await paginate(ThoughtOfDay, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
      populate: { path: "createdBy", select: "name email" },
    });

    return { status: 200, json: { success: true, ...result } };
  } catch (err) {
    console.error("getThoughtsController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * CREATE
 */
export async function createThoughtController({ body, user }) {
  try {
    let { text, startDate, endDate, images } = body;

    // convert to string safely
    if (Array.isArray(text)) text = text.join(" ");
    if (typeof text !== "string") text = String(text);

    if (!text.trim())
      return {
        status: 400,
        json: { success: false, message: "Text required" },
      };

    if (!startDate || !endDate)
      return {
        status: 400,
        json: { success: false, message: "Date range required" },
      };

    const s = new Date(startDate);
    const e = new Date(endDate);

    if (s > e)
      return {
        status: 400,
        json: { success: false, message: "startDate must be ≤ endDate" },
      };

    // Prevent overlapping thoughts
    const clash = await ThoughtOfDay.findOne({
      startDate: { $lte: e },
      endDate: { $gte: s },
    });

    if (clash) {
      return {
        status: 400,
        json: {
          success: false,
          message: "A thought already exists for this date range",
        },
      };
    }

    const doc = await ThoughtOfDay.create({
      text,
      images: Array.isArray(images) ? images : images ? [images] : [],
      startDate: s,
      endDate: e,
      createdBy: user._id,
    });

    return {
      status: 201,
      json: { success: true, message: "Created", data: doc },
    };
  } catch (err) {
    console.error("createThought:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * GET ONE THOUGHT
 */
export async function getThoughtController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id)) {
      return { status: 400, json: { success: false, message: "Invalid ID" } };
    }

    const thought = await ThoughtOfDay.findById(id);
    if (!thought) {
      return { status: 404, json: { success: false, message: "Not found" } };
    }

    return { status: 200, json: { success: true, data: thought } };
  } catch (err) {
    console.error("getThoughtController:", err);
    return { status: 500, json: { success: false, message: "Server error" } };
  }
}

/**
 * UPDATE
 */
export async function updateThoughtController({ id, body, user }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { success: false, message: "Invalid ID" } };

    const thought = await ThoughtOfDay.findById(id);
    if (!thought)
      return { status: 404, json: { success: false, message: "Not found" } };

    let { text, startDate, endDate, images } = body;

    // Update text if provided
    if (text !== undefined) {
      if (Array.isArray(text)) text = text.join(" ");
      if (typeof text !== "string") text = String(text);
      thought.text = text;
    }

    // Determine final dates (provided or existing)
    const s = startDate ? new Date(startDate) : thought.startDate;
    const e = endDate ? new Date(endDate) : thought.endDate;

    if (s > e)
      return {
        status: 400,
        json: { success: false, message: "startDate must be ≤ endDate" },
      };

    // Prevent overlapping with other thoughts (exclude itself)
    const clash = await ThoughtOfDay.findOne({
      _id: { $ne: id },
      startDate: { $lte: e },
      endDate: { $gte: s },
    });

    if (clash) {
      return {
        status: 400,
        json: {
          success: false,
          message: "A thought already exists for this date range",
        },
      };
    }

    thought.startDate = s;
    thought.endDate = e;

    if (images !== undefined) {
      thought.images = Array.isArray(images) ? images : [images];
    }

    thought.updatedBy = user._id;
    thought.updatedAt = new Date();
    await thought.save();

    return {
      status: 200,
      json: { success: true, message: "Updated", data: thought },
    };
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
