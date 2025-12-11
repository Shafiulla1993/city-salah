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
  const { id } = await ctx.params;

  // 1️⃣ parse form-data
  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  let body = { ...fields };

  // 2️⃣ Normalize simple fields (array -> first) EXCEPT contacts & prayerTimings
  Object.keys(body).forEach((key) => {
    if (
      Array.isArray(body[key]) &&
      key !== "contacts" &&
      key !== "prayerTimings"
    ) {
      body[key] = body[key][0];
    }
  });

  // 3️⃣ Parse JSON for contacts/prayerTimings/location (supports ["{...}"] and "{...}")
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    try {
      if (k === "contacts" || k === "prayerTimings") {
        // If sent as ["[{...}]"] → take first element then JSON.parse
        if (
          Array.isArray(body[k]) &&
          body[k].length === 1 &&
          typeof body[k][0] === "string"
        ) {
          body[k] = JSON.parse(body[k][0]);
        }
        // If sent as array of objects → keep as-is
        else if (Array.isArray(body[k])) {
          // do nothing
        }
        // If sent as string → parse
        else if (typeof body[k] === "string") {
          body[k] = JSON.parse(body[k]);
        }
      } else {
        // Original behavior for simple fields
        if (Array.isArray(body[k])) body[k] = body[k][0];
      }
      if (typeof body[k] === "string") body[k] = JSON.parse(body[k]);
      // Ensure prayerTimings is an array if parsed as object
      if (k === "prayerTimings" && body[k] && !Array.isArray(body[k])) {
        body[k] = [body[k]];
      }
    } catch {
      body[k] = undefined;
    }
  });

  // 4️⃣ IMAGE upload (if provided)
  let file = Array.isArray(files?.image) ? files.image[0] : files?.image;
  if (file) {
    const tmp = file.filepath;
    await connectDB();
    const old = await Masjid.findById(id).select("imagePublicId");

    try {
      const uploaded = await uploadFileToCloudinary(tmp, "masjids");
      body.imageUrl = uploaded.secure_url || uploaded.url;
      body.imagePublicId = uploaded.public_id;

      if (old?.imagePublicId) {
        cloudinary.uploader.destroy(old.imagePublicId).catch(() => {});
      }
    } finally {
      await fs.unlink(tmp).catch(() => {});
    }
  }

  // 5️⃣ call controller (no role flag here — route enforces withAuth)
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
