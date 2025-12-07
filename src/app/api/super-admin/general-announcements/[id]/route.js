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

// Convert incoming field to clean array
const fixList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return String(raw)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

export const GET = withAuth("super_admin", async (request, ctx) => {
  const { id } = await ctx.params;
  return await getGeneralAnnouncementController({ id });
});

export const PUT = withAuth("super_admin", async (request, ctx) => {
  const { id } = await ctx.params;
  const user = ctx.user;

  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };
  if (Array.isArray(body.title)) body.title = body.title[0];
  if (Array.isArray(body.body)) body.body = body.body[0];

  // Multi-select targets
  body.cities = fixList(fields["cities[]"] || fields["cities"]);
  body.areas = fixList(fields["areas[]"] || fields["areas"]);
  body.masjids = fixList(fields["masjids[]"] || fields["masjids"]);

  // Existing images to keep
  let existingImages = [];
  if (fields.images) {
    try {
      existingImages = JSON.parse(fields.images);
    } catch {
      existingImages = fixList(fields.images);
    }
  }

  // Upload new images
  const uploaded = [];
  const input = files?.images || files?.file || files?.files;
  const fileArr = Array.isArray(input) ? input : input ? [input] : [];

  for (const f of fileArr) {
    const up = await uploadFileToCloudinary(
      f.filepath || f.path,
      "announcements"
    );
    uploaded.push(up.secure_url || up.url);
    await fs.unlink(f.filepath || f.path).catch(() => {});
  }

  body.images = [...existingImages, ...uploaded];

  return await updateGeneralAnnouncementController({ id, body, user });
});

export const DELETE = withAuth("super_admin", async (request, ctx) => {
  const { id } = await ctx.params;
  return await deleteGeneralAnnouncementController({ id });
});
