// src/app/api/super-admin/general-prayer-timings/mappings/route.js

import {
  createMappingController,
  getMappingsController,
} from "@/server/controllers/superadmin/generalPrayerTimings.controller";
import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth(
  "super_admin",
  async () => await getMappingsController()
);

export const POST = withAuth("super_admin", async (req, user) => {
  const body = await req.json().catch(() => ({}));
  return await createMappingController({ body, user });
});
