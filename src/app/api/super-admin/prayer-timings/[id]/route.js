// src/app/api/super-admin/prayer-timings/[id]/route.js

import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const timing = await GeneralPrayerTiming.findById(params.id).populate(
    "city area"
  );
  if (!timing) return { status: 404, json: { message: "Timing not found" } };
  return { status: 200, json: timing };
});

export const PUT = withAuth("super_admin", async ({ request, params }) => {
  const body = await request.json();
  const updated = await GeneralPrayerTiming.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  if (!updated) return { status: 404, json: { message: "Timing not found" } };
  return { status: 200, json: updated };
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  await GeneralPrayerTiming.findByIdAndDelete(params.id);
  return { status: 200, json: { message: "Deleted" } };
});
