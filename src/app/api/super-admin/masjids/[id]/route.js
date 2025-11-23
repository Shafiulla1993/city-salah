// src/app/api/super-admin/masjids/[id]/route.js
import {
  getMasjidController,
  updateMasjidController,
  deleteMasjidController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getMasjidController({ id: params.id });
  return res;
});

export const PUT = withAuth("super_admin", async ({ request, params, user }) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({ fields: {}, files: {} }));
  const body = { ...fields };

  // parse JSON fields
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (typeof body[k] === "string") {
      try { body[k] = JSON.parse(body[k]); } catch {}
    }
  });

  if (files?.file || files?.image) {
    const file = files.file || files.image;
    try {
      const uploadRes = await uploadFileToCloudinary(file.filepath || file.path, "masjids");
      body.imageUrl = uploadRes.secure_url || uploadRes.url;
    } catch (err) {
      console.error("Masjid image upload failed:", err);
      return { status: 500, json: { success: false, message: "Image upload failed" } };
    } finally {
      try { const p = file.filepath || file.path; if (p) await fs.unlink(p).catch(() => {}); } catch {}
    }
  }

  const res = await updateMasjidController({ id: params.id, body, user });
  return res;
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteMasjidController({ id: params.id });
  return res;
});
