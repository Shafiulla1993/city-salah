// src/app/api/super-admin/areas/[id]/can-delete/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { canDeleteAreaController } from "@/server/controllers/superadmin/areas.controller";

export const GET = withAuth("super_admin", async (req, ctx) => {
  const { id } = ctx.params;
  const res = await canDeleteAreaController({ id });
  return res;
});
