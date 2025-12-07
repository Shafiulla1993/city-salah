// src/app/api/super-admin/general-announcements/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import {
  getGeneralAnnouncementsController,
  createGeneralAnnouncementController,
} from "@/server/controllers/superadmin/generalAnnouncements.controller";

// Convert incoming values into an array safely
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

export const GET = withAuth("super_admin", async (request) => {
  const url = request.nextUrl;
  const query = Object.fromEntries(url.searchParams.entries());
  return await getGeneralAnnouncementsController({ query });
});

export const POST = withAuth("super_admin", async (request, ctx) => {
  const user = ctx.user;

  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };

  if (Array.isArray(body.title)) body.title = body.title[0];
  if (Array.isArray(body.body)) body.body = body.body[0];

  // Multi-select IDs
  body.cities = fixList(fields["cities[]"] || fields["cities"]);
  body.areas = fixList(fields["areas[]"] || fields["areas"]);
  body.masjids = fixList(fields["masjids[]"] || fields["masjids"]);

  // Upload images
  const uploaded = [];
  const fileInputs = files?.images || files?.file;
  const fileArray = Array.isArray(fileInputs)
    ? fileInputs
    : fileInputs
    ? [fileInputs]
    : [];

  for (const f of fileArray) {
    const up = await uploadFileToCloudinary(
      f.filepath || f.path,
      "announcements"
    );
    uploaded.push(up.secure_url || up.url);
    await fs.unlink(f.filepath || f.path).catch(() => {});
  }

  body.images = uploaded;

  return await createGeneralAnnouncementController({ body, user });
});
