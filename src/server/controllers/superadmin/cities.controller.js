// src/server/controllers/superadmin/cities.controller.js
import City from "@/models/City";
import { generateSlug } from "@/lib/helpers/slugHelper";
import { paginate } from "@/server/utils/paginate";

export async function getCitiesController({ query }) {
  const { page, limit, search } = query;

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  return paginate(City, {
    page,
    limit,
    filter,
    sort: { createdAt: -1 }
  });
}

export async function getCityController({ id }) {
  const city = await City.findById(id);
  if (!city)
    return { status: 404, json: { success: false, message: "City not found" } };

  return { status: 200, json: { success: true, data: city } };
}

export async function createCityController({ body }) {
  const { name, timezone } = body;

  if (!name)
    return { status: 400, json: { success: false, message: "City name is required" } };

  const exists = await City.findOne({ name });
  if (exists)
    return { status: 400, json: { success: false, message: "City already exists" } };

  const slug = generateSlug(name);

  const city = await City.create({ name, slug, timezone });

  return {
    status: 201,
    json: { success: true, message: "City created", data: city }
  };
}

export async function updateCityController({ id, body }) {
  const city = await City.findById(id);
  if (!city)
    return { status: 404, json: { success: false, message: "City not found" } };

  Object.assign(city, body);

  if (body.name) city.slug = generateSlug(body.name);

  await city.save();

  return {
    status: 200,
    json: { success: true, message: "City updated", data: city }
  };
}

export async function deleteCityController({ id }) {
  await City.findByIdAndDelete(id);
  return {
    status: 200,
    json: { success: true, message: "City deleted" }
  };
}
