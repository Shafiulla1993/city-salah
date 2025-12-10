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

  let body = { ...fields };

  // ----------------------------------------------------
  // 1️⃣ RESTORE ORIGINAL NORMALIZATION:
  //    Convert array -> value[0]
  //    EXCEPT contacts & prayerTimings
  // ----------------------------------------------------
  Object.keys(body).forEach((key) => {
    if (
      Array.isArray(body[key]) &&
      key !== "contacts" &&
      key !== "prayerTimings"
    ) {
      body[key] = body[key][0];
    }
  });

  // ----------------------------------------------------
  // 2️⃣ JSON PARSE EXACTLY LIKE POST ROUTE
  // ----------------------------------------------------
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    try {
      // Case 1: Array coming in → take first value
      if (Array.isArray(body[k])) {
        body[k] = body[k][0];
      }

      // Case 2: String JSON → parse
      if (typeof body[k] === "string") {
        body[k] = JSON.parse(body[k]);
      }
    } catch (err) {
      console.error("JSON parse failed for", k, body[k]);
    }
  });

  // ----------------------------------------------------
  // 3️⃣ IMAGE UPLOAD (unchanged)
  // ----------------------------------------------------
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

      if (existing?.imagePublicId) {
        cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
      }
    } finally {
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }

  // ----------------------------------------------------
  // 4️⃣ LOCATION FALLBACK (unchanged)
  // ----------------------------------------------------
  if (!body.location || !Array.isArray(body.location.coordinates)) {
    await connectDB();
    const existing = await Masjid.findById(id).select("location");
    if (existing?.location) {
      body.location = existing.location;
    }
  }

  // ----------------------------------------------------
  // 5️⃣ Update Controller (unchanged)
  // ----------------------------------------------------
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
