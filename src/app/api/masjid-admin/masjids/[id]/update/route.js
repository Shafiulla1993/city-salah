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

  // 1️⃣ Parse multipart request
  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  let body = { ...fields };

  // ------------------------------------------------------
  // 2️⃣ RESTORE ORIGINAL NORMALIZATION (matches superadmin)
  //    Convert array -> first item EXCEPT contacts & timings
  // ------------------------------------------------------
  Object.keys(body).forEach((key) => {
    if (
      Array.isArray(body[key]) &&
      key !== "contacts" &&
      key !== "prayerTimings"
    ) {
      body[key] = body[key][0];
    }
  });

  // ------------------------------------------------------
  // 3️⃣ JSON PARSING (same logic used in superadmin PUT)
  // ------------------------------------------------------
  ["contacts", "prayerTimings"].forEach((k) => {
    try {
      if (Array.isArray(body[k])) {
        body[k] = body[k][0]; // restore original flow
      }

      if (typeof body[k] === "string") {
        body[k] = JSON.parse(body[k]);
      }
    } catch (err) {
      console.error("Failed to parse", k, body[k]);
      body[k] = []; // fallback only for contacts/timings
    }
  });

  // ------------------------------------------------------
  // 4️⃣ IMAGE HANDLING (allowed for masjid admin)
  // ------------------------------------------------------
  let fileObj = files?.image;
  let file = Array.isArray(fileObj) ? fileObj[0] : fileObj;

  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const tempPath = file.filepath;

    if (tempPath) {
      await connectDB();
      const existing = await Masjid.findById(id).select("imagePublicId");

      try {
        const uploaded = await uploadFileToCloudinary(tempPath, "masjids");
        imageUrl = uploaded.secure_url || uploaded.url;
        imagePublicId = uploaded.public_id;

        if (existing?.imagePublicId) {
          cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
        }
      } finally {
        await fs.unlink(tempPath).catch(() => {});
      }
    }
  }

  // ------------------------------------------------------
  // 5️⃣ ONLY PASS FIELDS THAT MASJID ADMIN IS ALLOWED TO UPDATE
  // ------------------------------------------------------
  return await updateMasjidController({
    id,
    contacts: body.contacts || [],
    prayerTimings: body.prayerTimings || [],
    imageUrl,
    imagePublicId,
    user: ctx.user,
  });
});
