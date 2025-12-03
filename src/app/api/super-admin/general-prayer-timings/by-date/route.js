// src/app/api/super-admin/general-prayer-timings/by-date/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { getTimingByDateController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const GET = withAuth("super_admin", async (req) => {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getTimingByDateController({ query });
  return res;
});
