// src/app/api/super-admin/prayer-timings/update-offsets/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { updateOffsetsController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const POST = withAuth("super_admin", async ({ request }) => {
  const body = await request.json();
  const res = await updateOffsetsController({ body });
  return res;
});
