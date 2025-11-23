// src/app/api/super-admin/prayer-timings/generate/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { generateTimingsForRange } from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const POST = withAuth("super_admin", async ({ request }) => {
  const body = await request.json();

  const res = await generateTimingsForRange(body);
  return res;
});
