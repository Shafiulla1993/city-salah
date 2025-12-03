// src/app/api/super-admin/general-prayer-timings/manual/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { createManualTimingController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const POST = withAuth("super_admin", async (req, user) => {
  const body = await req.json();
  const res = await createManualTimingController({ body, user });
  return res;
});
