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

export const GET = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params; // ✔ same fix as users
  const id = params.id;

  const res = await getMasjidController({ id });
  return res;
});

export const PUT = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = await params.id;

  const { fields, files } = await parseMultipart(req).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };

  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch {}
    }
  });

  if (files?.file || files?.image) {
    const file = files.file || files.image;
    try {
      const uploadRes = await uploadFileToCloudinary(
        file.filepath || file.path,
        "masjids"
      );
      body.imageUrl = uploadRes.secure_url || uploadRes.url;
    } finally {
      try {
        const p = file.filepath || file.path;
        if (p) await fs.unlink(p).catch(() => {});
      } catch {}
    }
  }

  const res = await updateMasjidController({ id, body });
  return res;
});

export const DELETE = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;

  const res = await deleteMasjidController({ id });
  return res;
});
