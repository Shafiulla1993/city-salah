// src/app/api/super-admin/areas/[id]/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";

import {
  getAreaController,
  updateAreaController,
  deleteAreaController,
} from "@/server/controllers/superadmin/areas.controller";

// GET /api/super-admin/areas/:id
export const GET = withAuth("super_admin", async (req, ctx) => {
  await connectDB();

  const { params } = await ctx.params;
  const result = await getAreaController({ id: params.id });

  return Response.json(result.json, { status: result.status });
});

// PUT /api/super-admin/areas/:id
export const PUT = withAuth("super_admin", async (req, ctx) => {
  await connectDB();

  const { params } = await ctx;
  const body = await req.json().catch(() => ({}));

  const result = await updateAreaController({ id: params.id, body });

  return Response.json(result.json, { status: result.status });
});

// DELETE /api/super-admin/areas/:id
export const DELETE = withAuth("super_admin", async (req, ctx) => {
  await connectDB();

  const { params } = await ctx;

  const result = await deleteAreaController({ id: params.id });

  return Response.json(result.json, { status: result.status });
});
