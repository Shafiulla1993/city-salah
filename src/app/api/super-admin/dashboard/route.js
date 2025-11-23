// src/app/api/super-admin/dashboard/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { dashboardSummaryController } from "@/server/controllers/superadmin/dashboard.controller";

/**
 * Secure Super Admin Dashboard Summary API
 * GET /api/super-admin/dashboard
 *
 * Only accessible by:
 *   role = "super_admin"
 */
export const GET = withAuth("super_admin", async () => {
  const res = await dashboardSummaryController();
  return res; // { status, json } automatically wrapped by withAuth
});
