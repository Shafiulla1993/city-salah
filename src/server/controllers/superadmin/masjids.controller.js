// src/server/controllers/superadmin/masjids.controller.js

import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";
import { generateSlug } from "@/lib/helpers/slugHelper";
import { paginate } from "@/server/utils/paginate";

/**
 * Helper: resolve city/area if caller passed a string name instead of ObjectId.
 * Returns { cityId, areaId } (may be same as input if already ObjectIds)
 */
async function resolveCityAreaIds({ city, area }) {
  let cityId = city;
  let areaId = area;

  if (city && typeof city === "string" && !mongoose.isValidObjectId(city)) {
    const foundCity = await City.findOne({
      name: { $regex: `^${city}$`, $options: "i" },
    });
    if (!foundCity) throw new Error(`City not found: ${city}`);
    cityId = foundCity._id;
  }

  if (area && typeof area === "string" && !mongoose.isValidObjectId(area)) {
    // try by name within resolved city if possible
    const areaQuery = { name: { $regex: `^${area}$`, $options: "i" } };
    if (cityId) areaQuery.city = cityId;
    const foundArea = await Area.findOne(areaQuery);
    if (!foundArea) throw new Error(`Area not found: ${area}`);
    areaId = foundArea._id;
  }

  return { cityId, areaId };
}

/**
 * Normalize time (e.g. "5:20" → "05:20 AM/PM")
 * - Fajr  => AM
 * - Zohar, asr, maghrib, isha => PM
 */
function normalizeTime(raw, prayer) {
  if (!raw) return "";

  let str = raw.toString().toUpperCase().trim();
  str = str.replace(/\./g, ":"); // allow 5.30 → 5:30
  str = str.replace(/AM|PM/g, "").trim(); // strip user AM/PM, we enforce

  let [hh, mm] = str.split(":");

  // hour only → assume :00
  if (!mm) mm = "00";

  hh = hh.replace(/\D/g, "");
  mm = mm.replace(/\D/g, "");

  // convert to valid 12-hour
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
 * Create Masjid (JSON)
 * Expects JSON body with fields matching Masjid model.
 * imageUrl should be a string (Cloudinary or remote URL) if provided.
 */
export async function createMasjidController({ body = {}, user }) {
  try {
    const b = { ...body };

    // ---------------------------------------
    // 1️⃣ Resolve City & Area IDs
    // ---------------------------------------
    try {
      const resolved = await resolveCityAreaIds({ city: b.city, area: b.area });
      if (resolved.cityId) b.city = resolved.cityId;
      if (resolved.areaId) b.area = resolved.areaId;
    } catch (err) {
      return { status: 404, json: { success: false, message: err.message } };
    }

    // ---------------------------------------
    // 2️⃣ Validations
    // ---------------------------------------
    if (!b.name)
      return {
        status: 400,
        json: { success: false, message: "Masjid name is required" },
      };

    if (!b.city)
      return {
        status: 400,
        json: { success: false, message: "City is required" },
      };

    if (!b.area)
      return {
        status: 400,
        json: { success: false, message: "Area is required" },
      };

    if (
      !Array.isArray(b.location?.coordinates) ||
      b.location.coordinates.length !== 2
    ) {
      return {
        status: 400,
        json: {
          success: false,
          message: "`location.coordinates` must be an array [lng, lat]",
        },
      };
    }

    // ---------------------------------------
    // 3️⃣ Ensure prayerTimings is valid (prevent null)
    // ---------------------------------------
    if (
      !b.prayerTimings ||
      !Array.isArray(b.prayerTimings) ||
      !b.prayerTimings[0]
    ) {
      b.prayerTimings = [
        {
          fajr: {},
          Zohar: {},
          asr: {},
          maghrib: {},
          isha: {},
          juma: {},
        },
      ];
    }

    // ---------------------------------------
    // 4️⃣ Normalize prayer timings
    // ---------------------------------------
    const p = b.prayerTimings[0];
    const keys = ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"];

    keys.forEach((k) => {
      if (!p[k]) p[k] = {};
      p[k].azan = normalizeTime(p[k].azan, k);
      p[k].iqaamat = normalizeTime(p[k].iqaamat, k);
    });

    // ---------------------------------------
    // 5️⃣ Ensure contacts is a valid array
    // ---------------------------------------
    if (!Array.isArray(b.contacts)) {
      b.contacts = [];
    }

    // ---------------------------------------
    // 6️⃣ Enforce slug uniqueness per area
    // ---------------------------------------
    const slug = generateSlug(b.name);
    const exists = await Masjid.findOne({ slug, area: b.area });

    if (exists) {
      return {
        status: 400,
        json: { success: false, message: "Another masjid exists in this area" },
      };
    }

    // ---------------------------------------
    // 7️⃣ Build masjidData object
    // ---------------------------------------
    const masjidData = {
      ...b,
      slug,
      createdBy: user?._id,
    };

    // ---------------------------------------
    // 8️⃣ Save to DB
    // ---------------------------------------
    const masjid = await Masjid.create(masjidData);

    return {
      status: 201,
      json: {
        success: true,
        message: "Masjid created successfully",
        data: masjid,
      },
    };
  } catch (err) {
    console.error("createMasjidController error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Create Masjid failed",
        error: err.message,
      },
    };
  }
}

/**
 * Get paginated list of masjids
 * Supports: page, limit, search, cityId, areaId
 */
export async function getAllMasjidsController({ query } = {}) {
  try {
    const { page, limit, search, cityId, areaId } = query || {};
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (cityId && mongoose.isValidObjectId(cityId)) filter.city = cityId;
    if (areaId && mongoose.isValidObjectId(areaId)) filter.area = areaId;

    // Use populate so frontend receives city/area objects (name + _id)
    const result = await paginate(Masjid, {
      page,
      limit,
      filter,
      populate: [
        { path: "city", select: "name" },
        { path: "area", select: "name" },
      ],
      sort: { createdAt: -1, _id: -1 },
    });

    // Optionally flatten some fields for list convenience (maintain full object in data)
    // We'll keep data as-is (populated objects) so frontend can show both id and name.
    return result;
  } catch (err) {
    console.error("getAllMasjidsController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Get single masjid (populated)
 */
export async function getMasjidController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id)) {
      return {
        status: 400,
        json: { success: false, message: "Invalid Masjid ID" },
      };
    }

    const masjid = await Masjid.findById(id).populate("city area");
    if (!masjid)
      return {
        status: 404,
        json: { success: false, message: "Masjid not found" },
      };

    return { status: 200, json: { success: true, data: masjid } };
  } catch (err) {
    console.error("getMasjidController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Update masjid (JSON)
 */
export async function updateMasjidController({ id, body = {}, user }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid Masjid ID" },
      };

    const masjid = await Masjid.findById(id);
    if (!masjid)
      return {
        status: 404,
        json: { success: false, message: "Masjid not found" },
      };

    const b = { ...body };

    // ----------------------------------------------------
    // 1️⃣ Resolve City / Area IDs
    // ----------------------------------------------------
    try {
      const resolved = await resolveCityAreaIds({ city: b.city, area: b.area });
      if (resolved.cityId) b.city = resolved.cityId;
      if (resolved.areaId) b.area = resolved.areaId;
    } catch (err) {
      return { status: 404, json: { success: false, message: err.message } };
    }

    // ----------------------------------------------------
    // 2️⃣ Validate location only if provided
    // ----------------------------------------------------
    if (
      b.location &&
      (!Array.isArray(b.location.coordinates) ||
        b.location.coordinates.length !== 2)
    ) {
      return {
        status: 400,
        json: {
          success: false,
          message: "`location.coordinates` must be [lng, lat]",
        },
      };
    }

    // ----------------------------------------------------
    // 3️⃣ Slug uniqueness check if name changed
    // ----------------------------------------------------
    if (b.name && b.name !== masjid.name) {
      const newSlug = generateSlug(b.name);
      const existing = await Masjid.findOne({
        slug: newSlug,
        area: b.area || masjid.area,
        _id: { $ne: masjid._id },
      });
      if (existing)
        return {
          status: 400,
          json: {
            success: false,
            message: "Another masjid exists in this area",
          },
        };
      masjid.slug = newSlug;
    }

    // ----------------------------------------------------
    // 4️⃣ Prevent prayerTimings = [null]
    // ----------------------------------------------------
    if (
      !b.prayerTimings ||
      !Array.isArray(b.prayerTimings) ||
      !b.prayerTimings[0]
    ) {
      b.prayerTimings = [
        {
          fajr: {},
          Zohar: {},
          asr: {},
          maghrib: {},
          isha: {},
          juma: {},
        },
      ];
    }

    // ----------------------------------------------------
    // 5️⃣ Assign updatable fields
    // ----------------------------------------------------
    const updatable = [
      "name",
      "address",
      "area",
      "city",
      "location",
      "imageUrl",
      "contacts",
      "prayerTimings",
      "timezone",
      "description",
    ];

    updatable.forEach((k) => {
      if (b[k] !== undefined) masjid[k] = b[k];
    });

    // ----------------------------------------------------
    // 6️⃣ Normalize timings AFTER assignment
    // ----------------------------------------------------
    if (masjid.prayerTimings?.[0]) {
      const p = masjid.prayerTimings[0];
      const keys = ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"];

      keys.forEach((k) => {
        if (!p[k]) p[k] = {};
        p[k].azan = normalizeTime(p[k].azan, k);
        p[k].iqaamat = normalizeTime(p[k].iqaamat, k);
      });
    }

    masjid.updatedAt = new Date();
    await masjid.save();

    const populated = await Masjid.findById(id).populate("city area");

    return {
      status: 200,
      json: {
        success: true,
        message: "Masjid updated successfully",
        data: populated,
      },
    };
  } catch (err) {
    console.error("updateMasjidController error:", err);
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

/**
 * Delete masjid
 */
export async function deleteMasjidController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid Masjid ID" },
      };

    const masjid = await Masjid.findById(id);
    if (!masjid)
      return {
        status: 404,
        json: { success: false, message: "Masjid not found" },
      };

    await Masjid.findByIdAndDelete(id);

    return {
      status: 200,
      json: { success: true, message: "Masjid deleted successfully" },
    };
  } catch (err) {
    console.error("deleteMasjidController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}
