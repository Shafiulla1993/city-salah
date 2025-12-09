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

  /** ------------------------------------------------------
   * 1️⃣ Parse multipart request (form fields + files)
   * ------------------------------------------------------ */
  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  let body = { ...fields };

  // Normalize array field values (["value"] → "value")
  Object.keys(body).forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key] = body[key][0];
    }
  });

  /** ------------------------------------------------------
   * 2️⃣ Parse JSON fields (contacts, prayerTimings)
   * ------------------------------------------------------ */
  ["contacts", "prayerTimings"].forEach((k) => {
    if (body[k] && typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch (err) {
        console.error(`Failed to parse JSON for ${k}:`, body[k]);
        body[k] = [];
      }
    }
  });

  /** ------------------------------------------------------
   * 3️⃣ IMAGE HANDLING — Similar to super-admin
   * ------------------------------------------------------ */

  let fileObj = files?.image;
  let file = null;

  // parse-multipart returns file arrays
  if (Array.isArray(fileObj)) file = fileObj[0];
  else file = fileObj;

  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const tempPath = file.filepath || file.path;

    if (tempPath) {
      await connectDB();
      const existing = await Masjid.findById(id).select("imagePublicId");

      try {
        const uploaded = await uploadFileToCloudinary(tempPath, "masjids");
        imageUrl = uploaded.secure_url || uploaded.url;
        imagePublicId = uploaded.public_id;

        // delete old image
        if (existing?.imagePublicId) {
          cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
        }
      } finally {
        await fs.unlink(tempPath).catch(() => {});
      }
    }
  }

  /** ------------------------------------------------------
   * 4️⃣ Pass everything to controller
   * ------------------------------------------------------ */

  return await updateMasjidController({
    id,
    contacts: body.contacts || [],
    prayerTimings: body.prayerTimings || [],
    imageUrl,
    imagePublicId,
    user: ctx.user,
  });
});
