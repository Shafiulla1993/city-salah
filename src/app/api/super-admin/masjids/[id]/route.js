// src/app/api/super-admin/masjids/[id]/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";

export const GET = withAuth("super_admin", async (_req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  const masjid = await Masjid.findById(id).populate("city area").lean();
  if (!masjid)
    return { status: 404, json: { success: false, message: "Not found" } };

  return { status: 200, json: { success: true, data: masjid } };
});

export const PUT = withAuth("super_admin", async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();

  const updated = await Masjid.findByIdAndUpdate(id, body, { new: true })
    .populate("city area")
    .lean();

  return { status: 200, json: { success: true, data: updated } };
});

export const DELETE = withAuth("super_admin", async (_req, { params }) => {
  const { id } = await params;

  await Masjid.findByIdAndDelete(id);
  await MasjidPrayerConfig.deleteOne({ masjid: id });

  return { status: 200, json: { success: true } };
});
