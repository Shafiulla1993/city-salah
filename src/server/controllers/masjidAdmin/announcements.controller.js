// src/server/controllers/masjidAdmin/announcements.controller.js
import mongoose from "mongoose";
import MasjidAnnouncement from "@/models/MasjidAnnouncement";
import { uploadFileToCloudinary } from "@/lib/cloudinary";

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

function checkMasjidAccess(user, masjidId) {
  const allowed = (user.masjidId || []).map(String);
  return allowed.includes(String(masjidId));
}

/**
 * 1. List announcements of a masjid
 */
export async function listMasjidAnnouncementsController({ masjidId, user }) {
  try {
    if (!isValidObjectId(masjidId))
      return {
        status: 400,
        json: { success: false, message: "Invalid masjidId" },
      };

    if (!checkMasjidAccess(user, masjidId))
      return { status: 403, json: { success: false, message: "Forbidden" } };

    const data = await MasjidAnnouncement.find({ masjidId }).sort({
      createdAt: -1,
    });
    return { status: 200, json: { success: true, data } };
  } catch (err) {
    console.error("listMasjidAnnouncementsController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/**
 * 2. Create announcement (only one at a time + auto-expire after 24h)
 */
export async function createMasjidAnnouncementController({
  masjidId,
  title,
  body,
  images = [],
  user,
}) {
  try {
    const uploadUrls = [];

    // Upload each selected image
    for (const img of images) {
      const uploadRes = await uploadFileToCloudinary(img, "announcements");
      uploadUrls.push(uploadRes.secure_url || uploadRes.url);
    }

    const announcement = await MasjidAnnouncement.create({
      masjidId,
      title,
      body,
      images: uploadUrls, // <= Save URLs only
    });

    return { status: 201, json: { success: true, data: announcement } };
  } catch (err) {
    console.error("createMasjidAnnouncementController error:", err);
    return {
      status: 500,
      json: { success: false, message: err.message },
    };
  }
}

/**
 * 3. Edit announcement
 */

export async function getMasjidAnnouncementByIdController({ id, user }) {
  try {
    if (!isValidObjectId(id)) {
      return { status: 400, json: { success: false, message: "Invalid id" } };
    }

    const ann = await MasjidAnnouncement.findById(id);
    if (!ann) {
      return { status: 404, json: { success: false, message: "Not found" } };
    }

    // ensure user is assigned to this masjid
    if (!checkMasjidAccess(user, ann.masjidId)) {
      return { status: 403, json: { success: false, message: "Forbidden" } };
    }

    return { status: 200, json: { success: true, data: ann } };
  } catch (err) {
    return { status: 500, json: { success: false, message: err.message } };
  }
}

export async function updateMasjidAnnouncementController({
  id,
  title,
  body,
  images,
  user,
}) {
  try {
    if (!isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid announcement ID" },
      };

    const ann = await MasjidAnnouncement.findById(id);
    if (!ann)
      return { status: 404, json: { success: false, message: "Not found" } };

    if (!checkMasjidAccess(user, ann.masjidId))
      return { status: 403, json: { success: false, message: "Forbidden" } };

    if (title !== undefined) ann.title = title;
    if (body !== undefined) ann.body = body;
    if (images !== undefined) ann.images = images;

    await ann.save();
    return {
      status: 200,
      json: { success: true, message: "Announcement updated", data: ann },
    };
  } catch (err) {
    console.error("updateMasjidAnnouncementController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}

/**
 * 4. Delete announcement manually
 */
export async function deleteMasjidAnnouncementController({ id, user }) {
  try {
    if (!isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid announcement ID" },
      };

    const ann = await MasjidAnnouncement.findById(id);
    if (!ann)
      return { status: 404, json: { success: false, message: "Not found" } };

    if (!checkMasjidAccess(user, ann.masjidId))
      return { status: 403, json: { success: false, message: "Forbidden" } };

    await ann.deleteOne();

    return {
      status: 200,
      json: { success: true, message: "Announcement deleted" },
    };
  } catch (err) {
    console.error("deleteMasjidAnnouncementController error:", err);
    return { status: 500, json: { success: false, message: err.message } };
  }
}
