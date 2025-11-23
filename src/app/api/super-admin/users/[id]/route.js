// src/app/api/super-admin/users/[id]/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";

import {
  getUserController,
  updateUserController,
  deleteUserController,
} from "@/server/controllers/superadmin/users.controller";

// GET /api/super-admin/users/:id
export const GET = withAuth("super_admin", async (req, { params }) => {
  await connectDB();

  const result = await getUserController({ id: params.id });

  return Response.json(result.json, { status: result.status });
});

// PUT /api/super-admin/users/:id
export const PUT = withAuth("super_admin", async (req, { params }) => {
  await connectDB();

  const body = await req.json().catch(() => ({}));

  const result = await updateUserController({ id: params.id, body });

  return Response.json(result.json, { status: result.status });
});

// DELETE /api/super-admin/users/:id
export const DELETE = withAuth("super_admin", async (req, { params }) => {
  await connectDB();

  const result = await deleteUserController({ id: params.id });

  return Response.json(result.json, { status: result.status });
});
