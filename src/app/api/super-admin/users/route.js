// src/app/api/super-admin/users/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import {
  getUsersController,
  createUserController,
} from "@/server/controllers/superadmin/users.controller";
import User from "@/models/User";

export const GET = withAuth("super_admin", async (request) => {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());

  const result = await getUsersController({ query });
  return Response.json(result.json, { status: result.status });
});

export const POST = withAuth("super_admin", async (request) => {
  await connectDB();
  const body = await request.json().catch(() => ({}));
  const result = await createUserController({ body });
  return Response.json(result.json, { status: result.status });
});
