// src/app/api/super-admin/prayer-timings/route.js

import { getAllTimingsController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";
import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async ({ request }) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getAllTimingsController({ query });
  return res;
});
