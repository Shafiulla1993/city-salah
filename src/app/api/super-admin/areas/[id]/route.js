// src/app/api/super-admin/areas/[id]/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";

import {
  getAreaController,
  updateAreaController,
  deleteAreaController,
} from "@/server/controllers/superadmin/areas.controller";

export const GET = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const { id } = await ctx.params;
  const result = await getAreaController({ id });
  return Response.json(result.json, { status: result.status });
});

export const PUT = withAuth("super_admin", async (req, ctx) => {
  await connectDB();
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const result = await updateAreaController({ id, body });
  return Response.json(result.json, { status: result.status });
});

export const DELETE = withAuth("super_admin", async (req, ctx) => {
  await connectDB();
  const { id } = await ctx.params;
  const result = await deleteAreaController({ id });
  return Response.json(result.json, { status: result.status });
});
