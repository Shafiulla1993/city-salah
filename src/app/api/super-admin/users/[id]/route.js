// src/app/api/super-admin/users/[id]/route.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Masjid from "@/models/Masjid";

/**
 * GET /api/super-admin/users/:id
 */
export const GET = withAuth("super_admin", async (_req, { params }) => {
  await connectDB();
  const { id } = await params;

  if (!mongoose.isValidObjectId(id))
    return Response.json(
      { success: false, message: "Invalid user id" },
      { status: 400 },
    );

  const user = await User.findById(id)
    .select("-password")
    .populate("city area masjidId");

  if (!user)
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );

  return Response.json({ success: true, data: user });
});

/**
 * PUT /api/super-admin/users/:id
 */
export const PUT = withAuth("super_admin", async (request, { params }) => {
  await connectDB();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (!mongoose.isValidObjectId(id))
    return Response.json(
      { success: false, message: "Invalid user id" },
      { status: 400 },
    );

  const user = await User.findById(id);
  if (!user)
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );

  // Email (unique)
  if (body.email && body.email !== user.email) {
    if (await User.findOne({ email: body.email }))
      return Response.json(
        { success: false, message: "Email already in use" },
        { status: 400 },
      );
    user.email = body.email;
  }

  // Phone (optional)
  if (body.phone?.trim() && body.phone !== user.phone) {
    if (await User.findOne({ phone: body.phone }))
      return Response.json(
        { success: false, message: "Phone already in use" },
        { status: 400 },
      );
    user.phone = body.phone;
  }

  // Password
  if (body.password?.trim()) {
    user.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10));
  }

  // Basic fields
  ["name", "role", "city", "area"].forEach((k) => {
    if (body[k] !== undefined) user[k] = body[k];
  });

  // Masjid assignment rules
  if (body.role && body.role !== "masjid_admin") {
    user.masjidId = [];
  }

  if (body.masjidId !== undefined) {
    const arr = Array.isArray(body.masjidId) ? body.masjidId : [body.masjidId];
    const count = await Masjid.countDocuments({ _id: { $in: arr } });

    if (count !== arr.length)
      return Response.json(
        { success: false, message: "Invalid masjid assignment" },
        { status: 400 },
      );

    user.masjidId = arr;
  }

  if (
    (body.role === "masjid_admin" || user.role === "masjid_admin") &&
    user.masjidId.length === 0
  ) {
    return Response.json(
      { success: false, message: "Masjid admin must have at least one masjid" },
      { status: 400 },
    );
  }

  await user.save();

  const updated = await User.findById(user._id)
    .select("-password")
    .populate("city area masjidId");

  return Response.json({ success: true, data: updated });
});

/**
 * DELETE /api/super-admin/users/:id
 */
export const DELETE = withAuth("super_admin", async (req, ctx) => {
  await connectDB();

  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid user ID" },
    };
  }

  const deleted = await User.findByIdAndDelete(id);

  if (!deleted) {
    return { status: 404, json: { success: false, message: "User not found" } };
  }

  return {
    status: 200,
    json: { success: true, message: "User deleted successfully" },
  };
});
