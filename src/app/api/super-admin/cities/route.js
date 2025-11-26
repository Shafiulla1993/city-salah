// src/app/api/super-admin/cities/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import {
  createCityController,
  getCitiesController,
} from "@/server/controllers/superadmin/cities.controller";

export const GET = withAuth("super_admin", async (request) => {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());

  const result = await getCitiesController({ query });
  return Response.json(result.json, { status: result.status });
});

export const POST = withAuth("super_admin", async (request) => {
  await connectDB();
  const body = await request.json().catch(() => ({}));
  const result = await createCityController({ body });
  return Response.json(result.json, { status: result.status });
});
