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

  // 1️⃣ Parse multipart
  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  let body = { ...fields };

  // 2️⃣ Normalize simple fields (EXCEPT contacts/prayerTimings)
  Object.keys(body).forEach((key) => {
    if (
      Array.isArray(body[key]) &&
      key !== "contacts" &&
      key !== "prayerTimings"
    ) {
      body[key] = body[key][0];
    }
  });

  // 3️⃣ Parse JSON safely (same as superadmin)
  ["contacts", "prayerTimings"].forEach((k) => {
    try {
      if (Array.isArray(body[k])) body[k] = body[k][0];
      if (typeof body[k] === "string") body[k] = JSON.parse(body[k]);
    } catch {
      body[k] = [];
    }
  });

  // 4️⃣ IMAGE handling (allowed for masjid admin)
  let file = Array.isArray(files?.image) ? files.image[0] : files?.image;
  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const temp = file.filepath;
    if (temp) {
      await connectDB();
      const existing = await Masjid.findById(id).select("imagePublicId");

      try {
        const uploaded = await uploadFileToCloudinary(temp, "masjids");
        imageUrl = uploaded.secure_url || uploaded.url;
        imagePublicId = uploaded.public_id;

        if (existing?.imagePublicId) {
          cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
        }
      } finally {
        await fs.unlink(temp).catch(() => {});
      }
    }
  }

  // 5️⃣ Only pass ALLOWED fields to controller
  return await updateMasjidController({
    id,
    contacts: body.contacts || [],
    prayerTimings: body.prayerTimings || [],
    imageUrl,
    imagePublicId,
    user: ctx.user,
  });
});
