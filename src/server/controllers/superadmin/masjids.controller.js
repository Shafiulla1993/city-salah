// src/server/controllers/superadmin/masjids.controller.js
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";
import { generateSlug } from "@/lib/helpers/slugHelper";
import { saveUploadedFile, deleteLocalFile } from "@/lib/middleware/parseForm";

/**
 * Safely parse JSON fields if they are strings
 */
function parseJSONFields(fields) {
  const copy = { ...fields };
  ["contacts", "prayerTimings", "location"].forEach((key) => {
    if (copy[key] && typeof copy[key] === "string") {
      try {
        copy[key] = JSON.parse(copy[key]);
      } catch (err) {
        throw new Error(`Invalid JSON format for ${key}`);
      }
    }
  });
  return copy;
}

// ---------------- CREATE ----------------
export async function createMasjidController({ fields = {}, file, user }) {
  try {
    const b = parseJSONFields(fields);

    // Handle uploaded image
    if (file) b.imageUrl = await saveUploadedFile(file, "uploads/masjids");

    // Resolve city/area IDs if strings
    if (b.city && !mongoose.isValidObjectId(b.city)) {
      const city = await City.findOne({ name: b.city });
      if (!city) return { status: 404, json: { message: "City not found" } };
      b.city = city._id;
    }
    if (b.area && !mongoose.isValidObjectId(b.area)) {
      const area = await Area.findOne({ name: b.area });
      if (!area) return { status: 404, json: { message: "Area not found" } };
      b.area = area._id;
    }

    // Validate required fields
    if (!b.name)
      return { status: 400, json: { message: "Masjid name is required" } };
    if (!b.location?.coordinates?.length === 2)
      return {
        status: 400,
        json: { message: "`location.coordinates` must be [lng, lat]" },
      };

    // Slug uniqueness
    const slug = generateSlug(b.name);
    const exists = await Masjid.findOne({ slug, area: b.area });
    if (exists) {
      if (b.imageUrl) deleteLocalFile(b.imageUrl, "uploads/masjids");
      return {
        status: 400,
        json: { message: "Another masjid exists in this area" },
      };
    }

    const masjidData = { ...b, slug, createdBy: user?._id };
    const masjid = await Masjid.create(masjidData);

    return {
      status: 201,
      json: { message: "Masjid created successfully", masjid },
    };
  } catch (err) {
    console.error("createMasjidController:", err);
    return {
      status: 500,
      json: { message: "Create Masjid failed", error: err.message },
    };
  }
}

// ---------------- GET ALL ----------------
export async function getAllMasjidsController() {
  try {
    const masjids = await Masjid.find()
      .populate({ path: "city", select: "name" })
      .populate({ path: "area", select: "name" });

    const result = masjids.map((m) => ({
      _id: m._id,
      name: m.name,
      city: m.city?.name || null,
      area: m.area?.name || null,
      address: m.address || "",
      phone: m.phone || "",
      image: m.imageUrl || "",
      contacts: m.contacts || [],
      prayerTimings: m.prayerTimings || [],
      location: m.location || null,
    }));

    return { status: 200, json: result };
  } catch (err) {
    console.error("getAllMasjidsController:", err);
    return {
      status: 500,
      json: { message: "Server error", error: err.message },
    };
  }
}

// ---------------- GET SINGLE ----------------
export async function getMasjidController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { message: "Invalid Masjid ID" } };
    const masjid = await Masjid.findById(id).populate("city area");
    if (!masjid) return { status: 404, json: { message: "Masjid not found" } };
    return { status: 200, json: masjid };
  } catch (err) {
    console.error("getMasjidController:", err);
    return {
      status: 500,
      json: { message: "Server error", error: err.message },
    };
  }
}

// ---------------- UPDATE ----------------
export async function updateMasjidController({ id, fields = {}, file, user }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { message: "Invalid Masjid ID" } };
    const masjid = await Masjid.findById(id);
    if (!masjid) return { status: 404, json: { message: "Masjid not found" } };

    const b = parseJSONFields(fields);

    // Resolve city/area if string
    if (b.city && !mongoose.isValidObjectId(b.city)) {
      const city = await City.findOne({ name: b.city });
      if (!city) return { status: 404, json: { message: "City not found" } };
      b.city = city._id;
    }
    if (b.area && !mongoose.isValidObjectId(b.area)) {
      const area = await Area.findOne({ name: b.area });
      if (!area) return { status: 404, json: { message: "Area not found" } };
      b.area = area._id;
    }

    // Handle uploaded image
    if (file) {
      const newFilename = await saveUploadedFile(file, "uploads/masjids");
      if (masjid.imageUrl) deleteLocalFile(masjid.imageUrl, "uploads/masjids");
      masjid.imageUrl = newFilename;
    }

    // Update fields
    Object.assign(masjid, b);

    // Slug update if name changed
    if (b.name && b.name !== masjid.name) {
      const newSlug = generateSlug(b.name);
      const existing = await Masjid.findOne({
        slug: newSlug,
        area: masjid.area,
        _id: { $ne: masjid._id },
      });
      if (existing)
        return {
          status: 400,
          json: { message: "Another masjid exists in this area" },
        };
      masjid.slug = newSlug;
    }

    masjid.updatedAt = new Date();
    await masjid.save();

    return {
      status: 200,
      json: { message: "Masjid updated successfully", masjid },
    };
  } catch (err) {
    console.error("updateMasjidController:", err);
    return {
      status: 500,
      json: { message: "Failed to update masjid", error: err.message },
    };
  }
}

// ---------------- DELETE ----------------
export async function deleteMasjidController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return { status: 400, json: { message: "Invalid Masjid ID" } };
    const masjid = await Masjid.findById(id);
    if (!masjid) return { status: 404, json: { message: "Masjid not found" } };

    if (masjid.imageUrl) deleteLocalFile(masjid.imageUrl, "uploads/masjids");
    await Masjid.findByIdAndDelete(id);

    return { status: 200, json: { message: "Masjid deleted successfully" } };
  } catch (err) {
    console.error("deleteMasjidController:", err);
    return {
      status: 500,
      json: { message: "Server error", error: err.message },
    };
  }
}
