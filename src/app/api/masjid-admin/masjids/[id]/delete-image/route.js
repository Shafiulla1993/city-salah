// src/app/api/masjid-admin/masjids/[id]/delete-image/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import Masjid from "@/models/Masjid";
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";

export const POST = withAuth("masjid_admin", async (req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const allowed = (ctx.user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }

  const masjid = await Masjid.findById(id);
  if (!masjid) {
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };
  }

  if (masjid.imagePublicId) {
    cloudinary.uploader.destroy(masjid.imagePublicId).catch(() => {});
  }

  masjid.imageUrl = "";
  masjid.imagePublicId = "";
  await masjid.save();

  return {
    status: 200,
    json: { success: true, message: "Image removed" },
  };
});
