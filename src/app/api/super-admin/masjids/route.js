// src/app/api/super-admin/masjids/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";

/* ===============================
   GET – List Masjids
================================ */
export const GET = withAuth("super_admin", async (request) => {
  const url = new URL(request.url);
  const {
    page = 1,
    limit = 10,
    search,
    sort = "-createdAt",
    cityId,
    areaId,
  } = Object.fromEntries(url.searchParams.entries());

  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, "i") }];
  if (mongoose.isValidObjectId(cityId)) filter.city = cityId;
  if (mongoose.isValidObjectId(areaId)) filter.area = areaId;

  const skip = (Number(page) - 1) * Number(limit);

  const data = await Masjid.find(filter)
    .populate("city", "name")
    .populate("area", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Masjid.countDocuments(filter);

  return {
    status: 200,
    json: {
      success: true,
      data,
      page: Number(page),
      limit: Number(limit),
      total,
    },
  };
});

/* ===============================
   POST – Create Masjid
   (Prayer rules saved later via /prayer-rules API)
================================ */
export const POST = withAuth("super_admin", async (request, ctx) => {
  const body = await request.json();
  const user = ctx.user;

  const city = await City.findById(body.city);
  const area = await Area.findById(body.area);

  if (!city || !area) {
    return {
      status: 400,
      json: { success: false, message: "Invalid City/Area" },
    };
  }

  const masjid = await Masjid.create({
    name: body.name,
    address: body.address || "",
    city: city._id,
    area: area._id,
    location: body.location,
    contacts: body.contacts || [],
    imageUrl: body.imageUrl || "",
    imagePublicId: body.imagePublicId || "",
    ladiesPrayerFacility: !!body.ladiesPrayerFacility,
    timezone: body.timezone || "Asia/Kolkata",
    createdBy: user._id,
  });

  // Create empty prayer config shell (rules will be filled by /prayer-rules)
  await MasjidPrayerConfig.create({
    masjid: masjid._id,
    rules: [],
  });

  const populated = await Masjid.findById(masjid._id).populate("city area");

  return {
    status: 201,
    json: { success: true, data: populated },
  };
});
