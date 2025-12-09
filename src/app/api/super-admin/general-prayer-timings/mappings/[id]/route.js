// src/app/api/super-admin/general-prayer-timings/mappings/[id]/route.js

import { deleteMappingController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";
import { withAuth } from "@/lib/middleware/withAuth";

export const DELETE = withAuth("super_admin", async (req, ctx) => {
  const { id } = await ctx.params; // <-- FIX
  return deleteMappingController({ id });
});
