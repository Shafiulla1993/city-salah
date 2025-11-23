// src/app/api/super-admin/prayer-timings/[id]/slot/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { updateSinglePrayerSlotController } from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const PUT = withAuth("super_admin", async ({ request, params, user }) => {
  const body = await request.json();

  const res = await updateSinglePrayerSlotController({
    id: params.id,
    slotName: body.slotName,
    startHHMM: body.startHHMM,
    endHHMM: body.endHHMM,
    user,
  });

  return res;
});
