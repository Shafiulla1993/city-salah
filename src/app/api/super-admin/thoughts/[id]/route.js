// src/app/api/super-admin/thoughts/[id]/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import {
  getThoughtController,
  updateThoughtController,
  deleteThoughtController,
} from "@/server/controllers/superadmin/thought.controller";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const GET = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const { id } = await ctx.params; // ✅ MUST AWAIT
  const result = await getThoughtController({ id });
  return Response.json(result.json, { status: result.status });
});

export const PUT = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const { id } = await ctx.params; // ✅ MUST AWAIT
  const user = ctx.user;

  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };
  const images = [];

  const fileArray = Array.isArray(files?.file)
    ? files.file
    : files?.file
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

  const result = await updateThoughtController({ id, body, user });
  return Response.json(result.json, { status: result.status });
});

export const DELETE = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const { id } = await ctx.params; // ✅ MUST AWAIT
  const result = await deleteThoughtController({ id });
  return Response.json(result.json, { status: result.status });
});
