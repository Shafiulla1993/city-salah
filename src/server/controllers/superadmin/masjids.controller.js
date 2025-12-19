// src/server/controllers/superadmin/masjids.controller.js

import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { paginate } from "@/server/utils/paginate";
import { resolvePrayerTimings } from "@/server/services/prayerResolver";

/* ------------------------------------
 * Helper: Resolve City & Area
 * ------------------------------------ */
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
    const query = { name: { $regex: `^${area}$`, $options: "i" } };
    if (cityId) query.city = cityId;
    const foundArea = await Area.findOne(query);
    if (!foundArea) throw new Error(`Area not found: ${area}`);
    areaId = foundArea._id;
  }

  return { cityId, areaId };
}

/* ------------------------------------
 * CREATE MASJID
 * ------------------------------------ */
export async function createMasjidController({ body = {}, user }) {
  try {
    const b = { ...body };

    // Resolve city & area
    const { cityId, areaId } = await resolveCityAreaIds({
      city: b.city,
      area: b.area,
    });
    b.city = cityId;
    b.area = areaId;

    if (!b.name?.trim())
      return {
        status: 400,
        json: { success: false, message: "Masjid name is required" },
      };

    if (!b.city || !b.area)
      return {
        status: 400,
        json: { success: false, message: "City & Area required" },
      };

    if (
      !Array.isArray(b.location?.coordinates) ||
      b.location.coordinates.length !== 2
    )
      return {
        status: 400,
        json: {
          success: false,
          message: "location.coordinates must be [lng, lat]",
        },
      };

    // Normalize contacts
    const contacts = Array.isArray(b.contacts)
      ? b.contacts
          .filter((c) => c?.role && c?.name)
          .map((c) => ({
            role: c.role,
            name: c.name.trim(),
            phone: c.phone?.trim() || "",
            email: c.email?.trim() || "",
            note: c.note?.trim() || "",
          }))
      : [];

    // Create masjid
    const masjid = await Masjid.create({
      name: b.name.trim(),
      address: b.address || "",
      city: b.city,
      area: b.area,
      location: b.location,
      contacts,
      imageUrl: b.imageUrl || "",
      imagePublicId: b.imagePublicId || "",
      timezone: b.timezone || "Asia/Kolkata",
      createdBy: user?._id,
    });

    // Create prayer config (1:1)
    await MasjidPrayerConfig.create({
      masjid: masjid._id,
      rules: [
        { prayer: "fajr", mode: "manual", manual: { azan: "", iqaamat: "" } },
        { prayer: "zohar", mode: "manual", manual: { azan: "", iqaamat: "" } },
        { prayer: "asr", mode: "manual", manual: { azan: "", iqaamat: "" } },
        {
          prayer: "maghrib",
          mode: "auto",
          auto: {
            source: "auqatus_salah",
            azan_offset_minutes: 2,
            iqaamat_offset_minutes: 4,
          },
          lastComputed: {
            azan: "",
            iqaamat: "",
            syncedAt: null,
          },
        },
        { prayer: "isha", mode: "manual", manual: { azan: "", iqaamat: "" } },
        { prayer: "juma", mode: "manual", manual: { azan: "", iqaamat: "" } },
      ],
    });

    return {
      status: 201,
      json: {
        success: true,
        message: "Masjid created successfully",
        data: masjid,
      },
    };
  } catch (err) {
    if (err.code === 11000) {
      return {
        status: 400,
        json: { success: false, message: "Masjid already exists in this area" },
      };
    }

    console.error(err);
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

/* ------------------------------------
 * GET ALL MASJIDS (PAGINATED)
 * ------------------------------------ */
export async function getAllMasjidsController({ query } = {}) {
  const { page, limit, search, cityId, areaId } = query || {};
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  if (mongoose.isValidObjectId(cityId)) filter.city = cityId;
  if (mongoose.isValidObjectId(areaId)) filter.area = areaId;

  return paginate(Masjid, {
    page,
    limit,
    filter,
    populate: [
      { path: "city", select: "name timezone" },
      { path: "area", select: "name" },
    ],
    sort: { createdAt: -1 },
  });
}

/* ------------------------------------
 * GET SINGLE MASJID (COMPOSED)
 * ------------------------------------ */
export async function getMasjidController({ id }) {
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  const masjid = await Masjid.findById(id).populate("city area");
  if (!masjid)
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };

  const config = await MasjidPrayerConfig.findOne({ masjid: id });

  const prayerTimings = resolvePrayerTimings({ config });

  return {
    status: 200,
    json: {
      success: true,
      data: {
        ...masjid.toObject(),
        prayerTimings: [prayerTimings],
      },
    },
  };
}

/* ------------------------------------
 * UPDATE MASJID (METADATA ONLY)
 * ------------------------------------ */
export async function updateMasjidController({ id, body = {} }) {
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  const masjid = await Masjid.findById(id);
  if (!masjid)
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };

  const b = { ...body };

  if (b.city || b.area) {
    const resolved = await resolveCityAreaIds(b);
    if (resolved.cityId) b.city = resolved.cityId;
    if (resolved.areaId) b.area = resolved.areaId;
  }

  ["name", "address", "city", "area", "location", "timezone"].forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(b, f)) {
      masjid[f] = b[f];
    }
  });

  if (Object.prototype.hasOwnProperty.call(b, "contacts")) {
    masjid.contacts = Array.isArray(b.contacts) ? b.contacts : [];
  }

  if (Object.prototype.hasOwnProperty.call(b, "imageUrl")) {
    masjid.imageUrl = b.imageUrl || "";
    masjid.imagePublicId = b.imagePublicId || "";
  }

  await masjid.save();

  const populated = await Masjid.findById(id).populate("city area");

  return {
    status: 200,
    json: { success: true, message: "Masjid updated", data: populated },
  };
}

/* ------------------------------------
 * DELETE MASJID
 * ------------------------------------ */
export async function deleteMasjidController({ id }) {
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  await Masjid.findByIdAndDelete(id);
  await MasjidPrayerConfig.deleteOne({ masjid: id });

  return {
    status: 200,
    json: { success: true, message: "Masjid deleted" },
  };
}
