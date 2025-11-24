// src/app/api/super-admin/cities/[id]/can-delete

import { withAuth } from "@/lib/middleware/withAuth";
import { canDeleteCityController } from "@/server/controllers/superadmin/cities.controller";

export const GET = withAuth("super_admin", async ({ params }) => {
  const { id } = await params;
  return await canDeleteCityController({ id });
});
