// src/server/controllers/superadmin/areas.controller.js
import mongoose from "mongoose";
import Area from "@/models/Area";
import City from "@/models/City";
import { generateSlug } from "@/lib/helpers/slugHelper";

export async function createAreaController({ body }) {
  const { name, city, center } = body;

  // Validate required fields
  if (!name || !city) {
    return { status: 400, json: { message: "Name and city are required" } };
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
        json: { message: `City not found: ${city}` },
      };
    }

    cityId = foundCity._id;
  }

  // Generate slug
  const slug = generateSlug(name);

  // Check existing slug in same city
  const existingSlug = await Area.findOne({ slug, city: cityId });
  if (existingSlug) {
    return {
      status: 400,
      json: {
        message: `Another area with a similar name already exists in this city (${name})`,
      },
    };
  }

  // Create area
  const newArea = await Area.create({
    name,
    city: cityId,
    slug,
    center,
  });

  return {
    status: 201,
    json: {
      message: "Area created successfully",
      data: newArea,
    },
  };
}

export async function getAreaController({ id }) {
  const area = await Area.findById(id);
  if (!area) return { status: 404, json: { message: "Area not found" } };
  return { status: 200, json: area };
}

export async function getAreasController() {
  const areas = await Area.find().populate("city");
  return { status: 200, json: areas };
}

export async function updateAreaController({ id, body }) {
  const { name, city, center } = body;
  const area = await Area.findById(id);
  if (!area) return { status: 404, json: { message: "Area not found" } };

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
          message: "Another area with this name already exists in this city",
        },
      };
    area.name = name;
    area.slug = slug;
  }

  if (city) area.city = city;
  if (center) area.center = center;

  await area.save();
  return { status: 200, json: { message: "Area updated successfully", area } };
}

export async function deleteAreaController({ id }) {
  await Area.findByIdAndDelete(id);
  return { status: 200, json: { message: "Area deleted" } };
}
