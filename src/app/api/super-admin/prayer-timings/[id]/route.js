// src/app/api/super-admin/prayer-timings/[id]/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import {
  getTimingByIdController,
  deleteTimingController,
} from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const GET = withAuth("super_admin", async ({ params }) => {
  return getTimingByIdController({ id: params.id });
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  return deleteTimingController({ id: params.id });
});
