// src/server/controllers/superadmin/cities.controller.js
import City from "@/models/City";
import {generateSlug}  from "@/lib/helpers/slugHelper";

export async function createCityController({ body }) {
  const { name, timezone } = body;
  if (!name) return { status: 400, json: { message: "City name is required" } };

  const existingCity = await City.findOne({ name });
  if (existingCity)
    return { status: 400, json: { message: "City already exists" } };

  const slug = generateSlug(name);
  const existingSlug = await City.findOne({ slug });
  if (existingSlug)
    return {
      status: 400,
      json: { message: "Another city with similar name already exists" },
    };

  const city = await City.create({ name, slug, timezone });
  return { status: 201, json: { message: "City created successfully", city } };
}

export async function getCityController({ id }) {
  const city = await City.findById(id);
  if (!city) return { status: 404, json: { message: "City not found" } };
  return { status: 200, json: city };
}

export async function getCitiesController() {
  const cities = await City.find();
  return { status: 200, json: cities };
}

export async function updateCityController({ id, body }) {
  const { name, timezone } = body;
  const city = await City.findById(id);
  if (!city) return { status: 404, json: { message: "City not found" } };

  if (name && name !== city.name) {
    const existingCity = await City.findOne({ name });
    if (existingCity && existingCity._id.toString() !== id)
      return {
        status: 400,
        json: { message: "Another city with this name already exists" },
      };
    city.name = name;
    city.slug = generateSlug(name);
  }

  if (timezone) city.timezone = timezone;
  await city.save();
  return { status: 200, json: { message: "City updated successfully", city } };
}

export async function deleteCityController({ id }) {
  await City.findByIdAndDelete(id);
  return { status: 200, json: { message: "City deleted" } };
}
