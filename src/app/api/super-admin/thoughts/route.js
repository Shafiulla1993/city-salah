// src/app/api/super-admin/thoughts/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import {
  getThoughtsController,
  createThoughtController,
} from "@/server/controllers/superadmin/thought.controller";

export const GET = withAuth("super_admin", async (request) => {
  await connectDB();
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const result = await getThoughtsController({ query });
  return result; // 🔥 DO NOT wrap with Response.json
});

export const POST = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const user = ctx.user;

  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };

  const images = [];
  const fileArray = Array.isArray(files.file)
    ? files.file
    : files.file
    ? [files.file]
    : [];

  for (const f of fileArray) {
    const uploaded = await uploadFileToCloudinary(
      f.filepath || f.path,
      "thoughts"
    );
    images.push(uploaded.secure_url);
    await fs.unlink(f.filepath || f.path).catch(() => {});
  }

  if (images.length) body.images = images;

  const result = await createThoughtController({ body, user });
  return result; // 🔥 DO NOT wrap with Response.json
});
