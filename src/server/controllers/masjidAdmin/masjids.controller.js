// src/server/controllers/masjidAdmin/masjids.controller.js
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import cloudinary from "@/lib/cloudinary";
import { resolvePrayerTimings } from "@/server/services/prayerResolver";

function normalizeTime(raw, prayer) {
  if (!raw) return "";

  let str = raw.toString().trim().toUpperCase();

  // replace dots with colon
  str = str.replace(/\./g, ":");

  // remove AM/PM if user typed
  str = str.replace(/\s*(AM|PM)\s*/g, "");

  let [hh, mm] = str.split(":");
  if (!mm) mm = "00";

  let h = parseInt(hh, 10);
  let m = parseInt(mm, 10);

  if (Number.isNaN(h)) return "";
  if (Number.isNaN(m)) m = 0;

  if (h <= 0) h = 12;
  if (h > 12) h = h % 12 || 12;
  if (m < 0) m = 0;
  if (m > 59) m = 59;

  const hhFmt = String(h).padStart(2, "0");
  const mmFmt = String(m).padStart(2, "0");

  const suffix = prayer === "fajr" ? "AM" : "PM";
  return `${hhFmt}:${mmFmt} ${suffix}`;
}

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

export async function getMasjidByIdController({ id, user }) {
  try {
    // Make sure this admin has access
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

    // Reuse your existing helper
    const found = await findMasjidById(id);
    if (!found.masjid) return found; // returns 400 or 404 automatically

    // Populate city + area
    const masjid = await Masjid.findById(id).populate("city area");

    return {
      status: 200,
      json: { success: true, data: masjid },
    };
  } catch (err) {
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

export async function updateMasjidController({
  id,
  image,
  contacts,
  prayerRules,
  user,
}) {
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  const allowed = (user.masjidId || []).map(String);
  if (!allowed.includes(String(id)))
    return { status: 403, json: { success: false, message: "Forbidden" } };

  /* ---------------- MASJID ---------------- */
  const masjid = await Masjid.findById(id);
  if (!masjid)
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };

  /* IMAGE */
  if (image?.imageUrl) {
    if (masjid.imagePublicId && masjid.imagePublicId !== image.imagePublicId) {
      cloudinary.uploader.destroy(masjid.imagePublicId).catch(() => {});
    }
    masjid.imageUrl = image.imageUrl;
    masjid.imagePublicId = image.imagePublicId || "";
  }

  /* CONTACTS */
  if (Array.isArray(contacts)) {
    masjid.contacts = contacts.filter((c) => c?.name?.trim());
  }

  await masjid.save();

  /* ---------------- PRAYER CONFIG ---------------- */
  if (prayerRules && typeof prayerRules === "object") {
    const config =
      (await MasjidPrayerConfig.findOne({ masjid: id })) ||
      (await MasjidPrayerConfig.create({ masjid: id, rules: [] }));

    for (const [prayer, rule] of Object.entries(prayerRules)) {
      const idx = config.rules.findIndex((r) => r.prayer === prayer);

      const next =
        prayer === "maghrib"
          ? {
              prayer,
              mode: "auto",
              auto: {
                source: "auqatus_salah",
                azan_offset_minutes: Number(rule.azanOffset || 0),
                iqaamat_offset_minutes: Number(rule.iqaamatOffset || 0),
              },
            }
          : {
              prayer,
              mode: "manual",
              manual: {
                azan: rule.azan || "",
                iqaamat: rule.iqaamat || "",
              },
            };

      if (idx >= 0) config.rules[idx] = next;
      else config.rules.push(next);
    }

    await config.save();
  }

  return {
    status: 200,
    json: { success: true, message: "Masjid updated successfully" },
  };
}

/* ----------------------------------
 * GET SINGLE MASJID (ADMIN VIEW)
 * ---------------------------------- */
export async function getMasjidAdminViewController({ id, user }) {
  if (!mongoose.isValidObjectId(id)) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const allowed = (user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }

  const masjid = await Masjid.findById(id).populate("city area");
  if (!masjid) {
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };
  }

  const config = await MasjidPrayerConfig.findOne({ masjid: id });

  const prayerTimings = resolvePrayerTimings({ config });

  return {
    status: 200,
    json: {
      success: true,
      data: {
        ...masjid.toObject(),
        prayerTimings: [prayerTimings], // ✅ SAME AS SUPER ADMIN
      },
    },
  };
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
