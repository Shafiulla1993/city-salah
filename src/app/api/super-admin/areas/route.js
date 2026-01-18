// src/app/api/super-admin/areas/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import Area from "@/models/Area";
import City from "@/models/City";
import { generateSlug } from "@/lib/helpers/slugHelper";

// GET  /api/super-admin/areas
// POST /api/super-admin/areas
export const GET = withAuth("super_admin", async (request) => {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "-createdAt";
  const cityId = searchParams.get("cityId") || "";

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (cityId) filter.city = cityId;

  const sort = {};
  if (sortParam.startsWith("-")) sort[sortParam.slice(1)] = -1;
  else sort[sortParam] = 1;

  const skip = (page - 1) * limit;

  const areas = await Area.find(filter)
    .populate("city", "name")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Area.countDocuments(filter);

  return {
    status: 200,
    json: {
      success: true,
      data: areas,
      page,
      limit,
      total,
    },
  };
});

export const POST = withAuth("super_admin", async (request) => {
  await connectDB();

  const body = await request.json().catch(() => ({}));
  const { name, city, center } = body;

  if (!name || !city) {
    return {
      status: 400,
      json: { success: false, message: "Area name and city are required" },
    };
  }

  const cityExists = await City.findById(city);
  if (!cityExists) {
    return {
      status: 404,
      json: { success: false, message: "City not found" },
    };
  }

  const slug = generateSlug(name);

  const exists = await Area.findOne({ city, slug });
  if (exists) {
    return {
      status: 400,
      json: {
        success: false,
        message: "Area with this name already exists in this city",
      },
    };
  }

  const area = await Area.create({
    name: name.trim(),
    city,
    slug,
    center,
  });

  return {
    status: 201,
    json: {
      success: true,
      message: "Area created successfully",
      data: area,
    },
  };
});
