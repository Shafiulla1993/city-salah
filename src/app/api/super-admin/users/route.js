// src/app/api/super-admin/users/route.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Masjid from "@/models/Masjid";

/**
 * GET /api/super-admin/users
 * Pagination, search, sort
 */
export const GET = withAuth("super_admin", async (request) => {
  await connectDB();

  const { searchParams } = request.nextUrl;

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "-createdAt";

  const skip = (page - 1) * limit;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select("-password")
    .populate("city area masjidId")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return Response.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/super-admin/users
 * Create user
 */
export const POST = withAuth("super_admin", async (request) => {
  await connectDB();

  const body = await request.json().catch(() => ({}));
  const { name, email, phone, password, city, area, role, masjidId } = body;

  if (!name || !email || !phone || !password || !city || !area) {
    return Response.json(
      {
        success: false,
        message: "name, email, phone, password, city and area are required",
      },
      { status: 400 },
    );
  }

  if (await User.findOne({ email }))
    return Response.json(
      { success: false, message: "Email already in use" },
      { status: 400 },
    );

  if (await User.findOne({ phone }))
    return Response.json(
      { success: false, message: "Phone already in use" },
      { status: 400 },
    );

  if (!mongoose.isValidObjectId(city))
    return Response.json(
      { success: false, message: "Invalid city" },
      { status: 400 },
    );

  if (!mongoose.isValidObjectId(area))
    return Response.json(
      { success: false, message: "Invalid area" },
      { status: 400 },
    );

  let masjidArray = [];
  if (role === "masjid_admin") {
    if (!masjidId || (Array.isArray(masjidId) && masjidId.length === 0)) {
      return Response.json(
        {
          success: false,
          message: "Masjid admin must have at least one masjid",
        },
        { status: 400 },
      );
    }

    masjidArray = Array.isArray(masjidId) ? masjidId : [masjidId];
    const count = await Masjid.countDocuments({ _id: { $in: masjidArray } });

    if (count !== masjidArray.length) {
      return Response.json(
        { success: false, message: "Invalid masjid assignment" },
        { status: 400 },
      );
    }
  }

  const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  const user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    city,
    area,
    role: role || "public",
    masjidId: masjidArray,
  });

  const created = await User.findById(user._id)
    .select("-password")
    .populate("city area masjidId");

  return Response.json({ success: true, data: created }, { status: 201 });
});
