// src/app/api/super-admin/thoughts/[id]/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import {
  getThoughtController,
  updateThoughtController,
  deleteThoughtController
} from "@/server/controllers/superadmin/thought.controller";
import fs from "fs/promises";

export const GET = withAuth("super_admin", async ({ params }) => {
  return await getThoughtController({ id: params.id });
});

export const PUT = withAuth("super_admin", async ({ request, params, user }) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({ fields: {}, files: {} }));
  const body = { ...fields };

  const images = [];
  const fileArray = Array.isArray(files.file)
    ? files.file
    : files.file
    ? [files.file]
    : [];

  for (const f of fileArray) {
    try {
      const uploaded = await uploadFileToCloudinary(f.filepath || f.path, "thoughts");
      images.push(uploaded.secure_url);
    } finally {
      try {
        await fs.unlink(f.filepath || f.path);
      } catch {}
    }
  }

  if (images.length) body.images = images;

  return await updateThoughtController({ id: params.id, body, user });
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  return await deleteThoughtController({ id: params.id });
});
