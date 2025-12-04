// src/app/api/super-admin/general-prayer-timings/list/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { listGeneralTimingsController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const GET = withAuth("super_admin", async (req) => {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await listGeneralTimingsController({ query });
  return res;
});
