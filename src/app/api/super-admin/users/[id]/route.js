// src/app/api/super-admin/users/[id]/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";

import {
  getUserController,
  updateUserController,
  deleteUserController,
} from "@/server/controllers/superadmin/users.controller";

export const GET = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const params = await ctx.params;
  const result = await getUserController({ id: params.id });
  return Response.json(result.json, { status: result.status });
});

export const PUT = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const params = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const result = await updateUserController({ id: params.id, body });
  return Response.json(result.json, { status: result.status });
});

export const DELETE = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const params = ctx.params;
  const result = await deleteUserController({ id: params.id });
  return Response.json(result.json, { status: result.status });
});
