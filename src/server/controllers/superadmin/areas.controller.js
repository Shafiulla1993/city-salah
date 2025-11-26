// src/server/controllers/superadmin/areas.controller.js
import mongoose from "mongoose";
import Area from "@/models/Area";
import City from "@/models/City";
import { generateSlug } from "@/lib/helpers/slugHelper";
import { paginate } from "@/server/utils/paginate";
import Masjid from "@/models/Masjid";
import User from "@/models/User";

export async function createAreaController({ body }) {
  const { name, city, center } = body;

  if (!name || !city) {
    return {
      status: 400,
      json: { success: false, message: "Name and city are required" },
    };
  }

  let cityId = city;

  // If city is a string name, find city by name
  if (typeof city === "string" && !mongoose.isValidObjectId(city)) {
    const foundCity = await City.findOne({
      name: { $regex: `^${city}$`, $options: "i" },
    });

    if (!foundCity) {
      return {
        status: 404,
        json: { success: false, message: `City not found: ${city}` },
      };
    }

    cityId = foundCity._id;
  }

  const slug = generateSlug(name);

  // Ensure uniqueness per city
  const existingSlug = await Area.findOne({ slug, city: cityId });
  if (existingSlug) {
    return {
      status: 400,
      json: {
        success: false,
        message: `Another area with a similar name already exists in this city (${name})`,
      },
    };
  }

  const newArea = await Area.create({
    name,
    city: cityId,
    slug,
    center,
  });

  return {
    status: 201,
    json: {
      success: true,
      message: "Area created successfully",
      data: newArea,
    },
  };
}

export async function getAreaController({ id }) {
  const area = await Area.findById(id).populate("city");
  if (!area)
    return { status: 404, json: { success: false, message: "Area not found" } };
  return { status: 200, json: { success: true, data: area } };
}

/**
 * Paginated list of areas
 * Accepts query: page, limit, search, cityId
 */
export async function getAreasController({ query } = {}) {
  const { page, limit, search, cityId } = query || {};
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (cityId) {
    if (mongoose.isValidObjectId(cityId)) {
      filter.city = cityId;
    } else if (/^[a-zA-Z0-9\- ]+$/.test(cityId)) {
      filter["city.name"] = { $regex: cityId, $options: "i" };
    } else {
      // Ignore invalid regex string
    }
  }

  // We will populate city so frontend can show city.name easily
  return paginate(Area, {
    page,
    limit,
    filter,
    populate: { path: "city", select: "name" },
    sort: { createdAt: -1, _id: -1 },
  });
}

export async function updateAreaController({ id, body }) {
  const { name, city, center } = body;
  const area = await Area.findById(id);
  if (!area)
    return { status: 404, json: { success: false, message: "Area not found" } };

  if (name && name !== area.name) {
    const slug = generateSlug(name);
    const existingSlug = await Area.findOne({
      slug,
      city: city || area.city,
      _id: { $ne: id },
    });
    if (existingSlug)
      return {
        status: 400,
        json: {
          success: false,
          message: "Another area with this name already exists in this city",
        },
      };
    area.name = name;
    area.slug = slug;
  }

  if (city) area.city = city;
  if (center) area.center = center;

  await area.save();
  return {
    status: 200,
    json: { success: true, message: "Area updated successfully", data: area },
  };
}

export async function deleteAreaController({ id }) {
  await Area.findByIdAndDelete(id);
  return { status: 200, json: { success: true, message: "Area deleted" } };
}

export async function canDeleteAreaController({ id }) {
  try {
    if (!id) {
      return {
        status: 400,
        json: { success: false, message: "Area ID required" },
      };
    }

    // Count linked masjids
    const linkedMasjids = await Masjid.countDocuments({
      area: id,
    });

    // Count linked users
    const linkedUsers = await User.countDocuments({
      area: id,
    });

    const canDelete = linkedMasjids === 0 && linkedUsers === 0;

    return {
      status: 200,
      json: {
        success: true,
        canDelete,
        linkedMasjids,
        linkedUsers,
      },
    };
  } catch (err) {
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}
