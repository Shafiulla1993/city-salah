// src/app/api/super-admin/cities/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import City from "@/models/City";
import { generateSlug } from "@/lib/helpers/slugHelper";

// GET  /api/super-admin/cities
// POST /api/super-admin/cities
export const GET = withAuth("super_admin", async (request) => {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 100;
  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "-createdAt"; // name | -name | createdAt | -createdAt

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const sort = {};
  if (sortParam.startsWith("-")) {
    sort[sortParam.slice(1)] = -1;
  } else {
    sort[sortParam] = 1;
  }

  const skip = (page - 1) * limit;

  const cities = await City.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await City.countDocuments(filter);

  return {
    status: 200,
    json: {
      success: true,
      data: cities,
      page,
      limit,
      total,
    },
  };
});

export const POST = withAuth("super_admin", async (request) => {
  await connectDB();

  const body = await request.json().catch(() => ({}));
  const { name, timezone, lat, lon } = body;

  if (!name || !name.trim()) {
    return {
      status: 400,
      json: { success: false, message: "City name is required" },
    };
  }

  if (!lat || !lon) {
    return {
      status: 400,
      json: { success: false, message: "Latitude & Longitude required" },
    };
  }

  const exists = await City.findOne({ name: name.trim() });
  if (exists) {
    return {
      status: 400,
      json: { success: false, message: "City already exists" },
    };
  }

  const slug = generateSlug(name);

  const city = await City.create({
    name: name.trim(),
    slug,
    timezone: timezone || "Asia/Kolkata",
    coords: { lat: Number(lat), lon: Number(lon) },
  });

  return {
    status: 201,
    json: {
      success: true,
      message: "City created successfully",
      data: city,
    },
  };
});
