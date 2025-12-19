// src/app/api/super-admin/prayers/sync-maghrib/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { syncMaghribController } from "@/server/controllers/superadmin/syncMaghrib.controller";

export const POST = withAuth("super_admin", async (request) => {
  const body = await request.json().catch(() => ({}));
  return await syncMaghribController(body);
});
