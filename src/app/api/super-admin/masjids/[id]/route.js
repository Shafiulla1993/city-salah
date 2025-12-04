// src/app/api/super-admin/masjids/[id]/route.js

import {
  getMasjidController,
  updateMasjidController,
  deleteMasjidController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import cloudinary, { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";

export const GET = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;
  return await getMasjidController({ id });
});

export const PUT = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;

  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  // clone fields to body
  const body = { ...fields };
  // Normalize all single-value fields (convert ["name"] → "name")
  Object.keys(body).forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key] = body[key][0];
    }
  });

  // 1️⃣ Parse JSON before Cloudinary steps
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (body[k] && typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch (e) {
        console.error("JSON parse failed for", k, body[k]);
      }
    }
  });

  // 2️⃣ Image upload (only if new image provided)
  if (files?.image) {
    const fileArr = files.image;
    const file = Array.isArray(fileArr) ? fileArr[0] : fileArr;
    const tempFilePath = file.filepath;

    await connectDB();
    const existing = await Masjid.findById(id).select("imagePublicId");

    try {
      const uploadRes = await uploadFileToCloudinary(tempFilePath, "masjids");
      body.imageUrl = uploadRes.secure_url || uploadRes.url;
      body.imagePublicId = uploadRes.public_id;

      // delete old image if exists
      if (existing?.imagePublicId) {
        cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
      }
    } finally {
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }

  // 3️⃣ Location fallback (do NOT erase previous location)
  if (!body.location || !Array.isArray(body.location.coordinates)) {
    await connectDB();
    const existing = await Masjid.findById(id).select("location");
    if (existing?.location) {
      body.location = existing.location;
    }
  }

  // 4️⃣ Update DB
  return await updateMasjidController({ id, body });
});

export const DELETE = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;

  await connectDB();
  const existing = await Masjid.findById(id).select("imagePublicId");

  const res = await deleteMasjidController({ id });

  // Delete from Cloudinary after DB remove
  if (existing?.imagePublicId) {
    cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
  }

  return res;
});
