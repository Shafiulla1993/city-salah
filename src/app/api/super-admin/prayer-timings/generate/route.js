// src/app/api/super-admin/prayer-timings/generate/route.js

import { generateDailyTimingsController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";
import { withAuth } from "@/server/utils/withAuth";

export const POST = withAuth("super_admin", async ({ request, user }) => {
  const body = await request.json();
  const res = await generateDailyTimingsController({ body, user });
  return res;
});
