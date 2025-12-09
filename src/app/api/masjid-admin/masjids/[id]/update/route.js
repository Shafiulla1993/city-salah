// src/app/api/masjid-admin/masjids/[id]/update/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { updateMasjidController } from "@/server/controllers/masjidAdmin/masjids.controller";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import fs from "fs/promises";

export const PUT = withAuth("masjid_admin", async (request, context) => {
  const { id } = await context.params;

  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  let contacts = [];
  let prayerTimings = [];

  try {
    contacts = JSON.parse(fields.contacts || "[]");
    prayerTimings = JSON.parse(fields.prayerTimings || "[]");
  } catch {
    return {
      status: 400,
      json: { success: false, message: "Invalid JSON format" },
    };
  }

  // optional image upload
  let imageFile = files?.image;
  let imageUrl = null;
  let imagePublicId = null;

  if (imageFile && typeof imageFile === "object") {
    const tempPath = imageFile.filepath || imageFile.path;
    if (tempPath) {
      try {
        await connectDB();
        const uploaded = await uploadFileToCloudinary(tempPath, "masjids");
        imageUrl = uploaded.secure_url || uploaded.url;
        imagePublicId = uploaded.public_id;
      } finally {
        await fs.unlink(tempPath).catch(() => {});
      }
    }
  }

  return await updateMasjidController({
    id,
    contacts,
    prayerTimings,
    imageUrl,
    imagePublicId,
    user: context.user,
  });
});
