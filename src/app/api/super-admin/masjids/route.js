// src/app/api/super-admin/masjids/route.js
import {
  createMasjidController,
  getAllMasjidsController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const GET = withAuth("super_admin", async (request) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getAllMasjidsController({ query });
  return res;
});

export const POST = withAuth("super_admin", async (request, user) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };
  // Normalize all single-value fields (convert ["name"] → "name")
  Object.keys(body).forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key] = body[key][0];
    }
  });

  // Convert JSON-encoded fields
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch {}
    }
  });

  // IMAGE UPLOAD
  if (files?.image) {
    const fileArray = files.image;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    const tempFilePath = file.filepath;

    if (!tempFilePath) {
      console.error("❌ Missing file path for Cloudinary upload");
      return {
        status: 500,
        json: { success: false, message: "Image upload failed (no filepath)" },
      };
    }

    try {
      const uploadRes = await uploadFileToCloudinary(tempFilePath, "masjids");
      body.imageUrl = uploadRes.secure_url || uploadRes.url;
      body.imagePublicId = uploadRes.public_id;
    } finally {
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }

  const res = await createMasjidController({ body, user });
  return res;
});
