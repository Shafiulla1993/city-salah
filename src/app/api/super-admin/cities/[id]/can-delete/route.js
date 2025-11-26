// src/app/api/super-admin/cities/can-delete

import { withAuth } from "@/lib/middleware/withAuth";
import { canDeleteCityController } from "@/server/controllers/superadmin/cities.controller";
import connectDB from "@/lib/db";

export const GET = withAuth("super_admin", async (request, ctx) => {
  await connectDB();
  const { id } = await ctx.params;

  const result = await canDeleteCityController({ id });
  return Response.json(result.json, { status: result.status });
});
