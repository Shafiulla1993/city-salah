// src/app/api/super-admin/general-announcements/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import {
  getGeneralAnnouncementsController,
  createGeneralAnnouncementController,
} from "@/server/controllers/superadmin/generalAnnouncements.controller";

export const GET = withAuth("super_admin", async ({ request }) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getGeneralAnnouncementsController({ query });
  return res;
});

export const POST = withAuth("super_admin", async ({ request, user }) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({ fields: {}, files: {} }));
  const body = { ...fields };

  // Parse arrays that might arrive as JSON strings
  ["cities", "areas", "masjids", "images"].forEach((k) => {
    if (typeof body[k] === "string") {
      try { body[k] = JSON.parse(body[k]); } catch { body[k] = body[k].split(",").map(s => s.trim()).filter(Boolean); }
    }
  });

  // handle file uploads (images) - files may be single or array
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

  const res = await createGeneralAnnouncementController({ body, user });
  return res;
});
