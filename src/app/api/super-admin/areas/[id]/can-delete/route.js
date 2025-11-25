// src/app/api/super-admin/areas/[id]/can-delete/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { canDeleteAreaController } from "@/server/controllers/superadmin/areas.controller";

export const GET = withAuth("super_admin", async (req, ctx) => {
  await connectDB();

  const { id } = await ctx.params;

  const res = await canDeleteAreaController({ id });

  return Response.json(res.json, { status: res.status });
});
