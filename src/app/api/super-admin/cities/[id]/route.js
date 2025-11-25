// src/app/api/super-admin/cities/[id]/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import {
  getCityController,
  updateCityController,
  deleteCityController,
} from "@/server/controllers/superadmin/cities.controller";

export const GET = withAuth("super_admin", async ({ request }, ctx) => {
  await connectDB();
  const params = ctx.params;
  const result = await getCityController({ id: params.id });
  return Response.json(result.json, { status: result.status });
});

export const PUT = withAuth("super_admin", async ({ request }, ctx) => {
  await connectDB();
  const params = ctx.params;
  const body = await request.json().catch(() => ({}));
  const result = await updateCityController({ id: params.id, body });
  return Response.json(result.json, { status: result.status });
});

export const DELETE = withAuth("super_admin", async ({ request }, ctx) => {
  await connectDB();
  const params = ctx.params;
  const result = await deleteCityController({ id: params.id });
  return Response.json(result.json, { status: result.status });
});
