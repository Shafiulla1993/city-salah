// src/server/controllers/masjidAdmin/masjids.controller.js
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import cloudinary from "@/lib/cloudinary";

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
  contacts,
  prayerTimings,
  imageUrl,
  imagePublicId,
  user,
}) {
  try {
    // permission check (route enforces role, this ensures masjid assigned)
    const allowed = (user.masjidId || []).map(String);
    if (!allowed.includes(String(id))) {
      return { status: 403, json: { success: false, message: "Forbidden" } };
    }

    const check = await findMasjidById(id);
    if (!check.masjid) return check;

    const masjid = check.masjid;
    const existing = masjid.toObject();

    // CONTACTS: only update if provided AND contains at least one non-empty name.
    if (Array.isArray(contacts)) {
      // keep any contact objects even if name empty? per earlier decision for masjid-admin: empty => KEEP OLD
      // So we only apply if provided array contains at least one object with a non-empty name OR if array length differs from existing
      const hasNonEmpty = contacts.some((c) => c?.name?.toString().trim());
      if (hasNonEmpty) {
        // Build filtered list: only include those with non-empty name (others are ignored to preserve old).
        const filtered = contacts.filter((c) => c?.name?.toString().trim());
        // Merge filtered into existing by role: update roles present in filtered, keep others
        const merged = (existing.contacts || []).slice();
        filtered.forEach((nc) => {
          const idx = merged.findIndex((x) => x.role === nc.role);
          if (idx === -1) merged.push(nc);
          else merged[idx] = { ...merged[idx], ...nc };
        });
        masjid.contacts = merged;
      }
    }

    // PRAYER TIMINGS: update only when new non-empty values provided (Option-A)
    if (Array.isArray(prayerTimings) && prayerTimings.length > 0) {
      const incoming = prayerTimings[0];
      const old = existing.prayerTimings?.[0] || {};
      const keys = ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"];
      const out = {};

      for (const k of keys) {
        const newEntry = incoming?.[k] || {};
        const oldEntry = old[k] || {};

        const hasNew =
          newEntry.azan?.toString().trim() ||
          newEntry.iqaamat?.toString().trim();

        if (!hasNew) {
          // keep old entry
          out[k] = oldEntry;
        } else {
          out[k] = {
            azan: normalizeTime(newEntry.azan, k),
            iqaamat: normalizeTime(newEntry.iqaamat, k),
          };
        }
      }

      masjid.prayerTimings = [out];
    }

    // IMAGE (only update if new image provided)
    if (imageUrl) {
      if (
        existing.imagePublicId &&
        imagePublicId &&
        imagePublicId !== existing.imagePublicId
      ) {
        cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
      }
      masjid.imageUrl = imageUrl;
      masjid.imagePublicId = imagePublicId;
    }

    masjid.updatedAt = new Date();
    await masjid.save();

    const populated = await Masjid.findById(id).populate("city area");
    return {
      status: 200,
      json: { success: true, message: "Masjid updated", data: populated },
    };
  } catch (err) {
    console.error("masjid-admin update error:", err);
    return {
      status: 500,
      json: { success: false, message: "Update failed", error: err.message },
    };
  }
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
