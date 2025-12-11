// src/app/api/masjid-admin/masjids/[id]/update/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import fs from "fs/promises";
import Masjid from "@/models/Masjid";
import cloudinary from "@/lib/cloudinary";
import { updateMasjidController } from "@/server/controllers/masjidAdmin/masjids.controller";

export const PUT = withAuth("masjid_admin", async (req, ctx) => {
  const { id } = await ctx.params;

  // parse multipart
  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  let body = { ...fields };

  // Normalize simple fields (array -> first) BUT we usually don't need those here.
  Object.keys(body).forEach((key) => {
    if (
      Array.isArray(body[key]) &&
      key !== "contacts" &&
      key !== "prayerTimings"
    ) {
      body[key] = body[key][0];
    }
  });

  // Parse JSON for contacts/prayerTimings
  ["contacts", "prayerTimings"].forEach((k) => {
    try {
      if (Array.isArray(body[k])) body[k] = body[k][0];
      if (typeof body[k] === "string") body[k] = JSON.parse(body[k]);
      // ensure arrays
      if (k === "prayerTimings" && body[k] && !Array.isArray(body[k])) {
        body[k] = [body[k]];
      }
      if (k === "contacts" && body[k] && !Array.isArray(body[k])) {
        body[k] = [body[k]];
      }
    } catch {
      body[k] = undefined;
    }
  });

  // Image upload
  let file = Array.isArray(files?.image) ? files.image[0] : files?.image;
  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const tmp = file.filepath;
    await connectDB();
    const old = await Masjid.findById(id).select("imagePublicId");

    try {
      const uploaded = await uploadFileToCloudinary(tmp, "masjids");
      imageUrl = uploaded.secure_url || uploaded.url;
      imagePublicId = uploaded.public_id;

      if (old?.imagePublicId) {
        cloudinary.uploader.destroy(old.imagePublicId).catch(() => {});
      }
    } finally {
      await fs.unlink(tmp).catch(() => {});
    }
  }

  // Pass only allowed fields to masjid-admin controller. If not provided, they will be undefined.
  return await updateMasjidController({
    id,
    contacts: body.contacts,
    prayerTimings: body.prayerTimings,
    imageUrl,
    imagePublicId,
    user: ctx.user,
  });
});
