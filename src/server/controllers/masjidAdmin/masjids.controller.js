// src/server/controllers/masjidAdmin/masjids.controller.js
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";

/**
 * Normalize time like superadmin controller
 */
function normalizeTime(raw, prayer) {
  if (!raw) return "";

  let str = raw.toString().toUpperCase().trim();
  str = str.replace(/\./g, ":");
  str = str.replace(/AM|PM/g, "").trim();

  let [hh, mm] = str.split(":");
  if (!mm) mm = "00";

  hh = hh.replace(/\D/g, "");
  mm = mm.replace(/\D/g, "");

  let h = parseInt(hh, 10) || 0;
  let m = parseInt(mm, 10) || 0;

  if (h <= 0) h = 12;
  if (h > 12) h = h % 12 || 12;
  if (m < 0 || Number.isNaN(m)) m = 0;
  if (m > 59) m = m % 60;

  const hhFmt = String(h).padStart(2, "0");
  const mmFmt = String(m).padStart(2, "0");

  const suffix = prayer === "fajr" ? "AM" : "PM";
  return `${hhFmt}:${mmFmt} ${suffix}`;
}

/**
 * Helper: ensure masjid exists
 */
async function findMasjidById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid Masjid ID" },
    };
  }

  const masjid = await Masjid.findById(id);
  if (!masjid) {
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };
  }

  return { masjid };
}

/**
 * List masjids accessible to this masjid_admin
 */
export async function getMyMasjidsController({ user }) {
  try {
    const ids = Array.isArray(user.masjidId) ? user.masjidId : [];
    const masjids = await Masjid.find({ _id: { $in: ids } })
      .populate("city area")
      .sort({ name: 1 });

    return {
      status: 200,
      json: { success: true, data: masjids },
    };
  } catch (err) {
    console.error("getMyMasjidsController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Get single masjid (only if belongs to admin)
 */
export async function getMyMasjidController({ id, user }) {
  try {
    const allowedIds = (user.masjidId || []).map(String);
    if (!allowedIds.includes(String(id))) {
      return {
        status: 403,
        json: {
          success: false,
          message: "Forbidden: Not assigned to this masjid",
        },
      };
    }

    const check = await findMasjidById(id);
    if (!check.masjid) return check;

    const populated = await Masjid.findById(id).populate("city area");
    return {
      status: 200,
      json: { success: true, data: populated },
    };
  } catch (err) {
    console.error("getMyMasjidController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Update contacts only
 */
export async function updateMasjidContactsController({ id, contacts, user }) {
  try {
    const allowedIds = (user.masjidId || []).map(String);
    if (!allowedIds.includes(String(id))) {
      return {
        status: 403,
        json: {
          success: false,
          message: "Forbidden: Not assigned to this masjid",
        },
      };
    }

    const check = await findMasjidById(id);
    if (!check.masjid) return check;

    const masjid = check.masjid;
    masjid.contacts = contacts;
    masjid.updatedAt = new Date();
    await masjid.save();

    const populated = await Masjid.findById(masjid._id).populate("city area");
    return {
      status: 200,
      json: {
        success: true,
        message: "Contacts updated successfully",
        data: populated,
      },
    };
  } catch (err) {
    console.error("updateMasjidContactsController error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Failed to update contacts",
        error: err.message,
      },
    };
  }
}

/**
 * Update prayer timings only
 */
export async function updateMasjidPrayerTimingsController({
  id,
  prayerTimings,
  user,
}) {
  try {
    const allowedIds = (user.masjidId || []).map(String);
    if (!allowedIds.includes(String(id))) {
      return {
        status: 403,
        json: {
          success: false,
          message: "Forbidden: Not assigned to this masjid",
        },
      };
    }

    const check = await findMasjidById(id);
    if (!check.masjid) return check;

    const masjid = check.masjid;

    if (!Array.isArray(prayerTimings) || prayerTimings.length === 0) {
      return {
        status: 400,
        json: {
          success: false,
          message: "prayerTimings must be a non-empty array",
        },
      };
    }

    const p = prayerTimings[0];
    const keys = ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"];
    for (const k of keys) {
      if (p && p[k]) {
        p[k].azan = normalizeTime(p[k].azan, k);
        p[k].iqaamat = normalizeTime(p[k].iqaamat, k);
      }
    }

    masjid.prayerTimings = prayerTimings;
    masjid.updatedAt = new Date();
    await masjid.save();

    const populated = await Masjid.findById(masjid._id).populate("city area");
    return {
      status: 200,
      json: {
        success: true,
        message: "Prayer timings updated successfully",
        data: populated,
      },
    };
  } catch (err) {
    console.error("updateMasjidPrayerTimingsController error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Failed to update prayer timings",
        error: err.message,
      },
    };
  }
}

/**
 * Update image (imageUrl + imagePublicId only)
 */
export async function updateMasjidImageController({
  id,
  imageUrl,
  imagePublicId,
  user,
}) {
  try {
    const allowedIds = (user.masjidId || []).map(String);
    if (!allowedIds.includes(String(id))) {
      return {
        status: 403,
        json: {
          success: false,
          message: "Forbidden: Not assigned to this masjid",
        },
      };
    }

    const check = await findMasjidById(id);
    if (!check.masjid) return check;

    const masjid = check.masjid;

    if (!imageUrl) {
      return {
        status: 400,
        json: { success: false, message: "imageUrl is required" },
      };
    }

    masjid.imageUrl = imageUrl;
    if (imagePublicId) {
      masjid.imagePublicId = imagePublicId;
    }
    masjid.updatedAt = new Date();
    await masjid.save();

    const populated = await Masjid.findById(masjid._id).populate("city area");
    return {
      status: 200,
      json: {
        success: true,
        message: "Masjid image updated successfully",
        data: populated,
      },
    };
  } catch (err) {
    console.error("updateMasjidImageController error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Failed to update image",
        error: err.message,
      },
    };
  }
}

/**
 * Unified update: contacts, prayer timings & image (optional)
 */
export async function updateMasjidController({
  id,
  contacts,
  prayerTimings,
  imageUrl,
  imagePublicId,
  user,
}) {
  try {
    const allowedIds = (user.masjidId || []).map(String);
    if (!allowedIds.includes(String(id))) {
      return {
        status: 403,
        json: {
          success: false,
          message: "Forbidden: Not assigned to this masjid",
        },
      };
    }

    const check = await findMasjidById(id);
    if (!check.masjid) return check;

    const masjid = check.masjid;

    // CONTACTS
    if (Array.isArray(contacts)) {
      masjid.contacts = contacts;
    }

    // PRAYER TIMINGS
    if (Array.isArray(prayerTimings) && prayerTimings.length > 0) {
      const p = prayerTimings[0];
      const keys = ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"];
      for (const k of keys) {
        if (p && p[k]) {
          p[k].azan = normalizeTime(p[k].azan, k);
          p[k].iqaamat = normalizeTime(p[k].iqaamat, k);
        }
      }
      masjid.prayerTimings = prayerTimings;
    }

    // IMAGE (only update when provided)
    if (imageUrl) {
      masjid.imageUrl = imageUrl;
      if (imagePublicId) {
        masjid.imagePublicId = imagePublicId;
      }
    }

    masjid.updatedAt = new Date();
    await masjid.save();

    const populated = await Masjid.findById(masjid._id).populate("city area");
    return {
      status: 200,
      json: {
        success: true,
        message: "Masjid updated successfully",
        data: populated,
      },
    };
  } catch (err) {
    console.error("updateMasjid error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Failed to update masjid",
        error: err.message,
      },
    };
  }
}
