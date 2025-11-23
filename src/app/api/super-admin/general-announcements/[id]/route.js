// src/app/api/super-admin/general-announcements/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import {
  getGeneralAnnouncementController,
  updateGeneralAnnouncementController,
  deleteGeneralAnnouncementController,
} from "@/server/controllers/superadmin/generalAnnouncements.controller";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getGeneralAnnouncementController({ id: params.id });
  return res;
});

export const PUT = withAuth("super_admin", async ({ request, params, user }) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({ fields: {}, files: {} }));
  const body = { ...fields };

  ["cities", "areas", "masjids", "images"].forEach((k) => {
    if (typeof body[k] === "string") {
      try { body[k] = JSON.parse(body[k]); } catch { body[k] = body[k].split(",").map(s=>s.trim()).filter(Boolean); }
    }
  });

  const uploaded = [];
  const fileInputs = files?.images || files?.files || files?.file;
  const fileArray = Array.isArray(fileInputs) ? fileInputs : fileInputs ? [fileInputs] : [];

  for (const f of fileArray) {
    try {
      const up = await uploadFileToCloudinary(f.filepath || f.path, "announcements");
      uploaded.push(up.secure_url || up.url);
    } catch (err) {
      console.error("Announcement image upload failed:", err);
      try { await fs.unlink(f.filepath || f.path).catch(()=>{}); } catch {}
      return { status: 500, json: { success: false, message: "Image upload failed" } };
    } finally {
      try { await fs.unlink(f.filepath || f.path).catch(()=>{}); } catch {}
    }
  }

  if (uploaded.length) body.images = [...(body.images || []), ...uploaded];

  const res = await updateGeneralAnnouncementController({ id: params.id, body, user });
  return res;
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteGeneralAnnouncementController({ id: params.id });
  return res;
});
