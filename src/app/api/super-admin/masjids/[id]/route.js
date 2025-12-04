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

  const res = await getMasjidController({ id });
  return res;
});

export const PUT = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = await params.id;

  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };

  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch {
        // ignore parse errors, leave as string
      }
    }
  });

  // If image provided → upload new, delete old from Cloudinary
  if (files?.file || files?.image) {
    const file = files.file || files.image;

    try {
      // Need DB connection for querying existing record
      await connectDB();
      const existing = await Masjid.findById(id).select("imagePublicId");

      const uploadRes = await uploadFileToCloudinary(
        file.filepath || file.path,
        "masjids"
      );

      body.imageUrl = uploadRes.secure_url || uploadRes.url;
      body.imagePublicId = uploadRes.public_id;

      // Delete old image from Cloudinary if exists
      if (existing?.imagePublicId) {
        cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
      }
    } finally {
      // Clean up temp file
      try {
        const p = file.filepath || file.path;
        if (p) await fs.unlink(p).catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  const res = await updateMasjidController({ id, body });
  return res;
});

export const DELETE = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;

  // get existing image public_id before delete
  await connectDB();
  const existing = await Masjid.findById(id).select("imagePublicId");

  const res = await deleteMasjidController({ id });

  // Best-effort cleanup of Cloudinary image
  if (existing?.imagePublicId) {
    cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
  }

  return res;
});
