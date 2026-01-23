// src/app/api/super-admin/general-prayer-timings/[id]/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import { normalizeTime } from "@/lib/helpers/normalizeTime";

export const GET = withAuth("super_admin", async (req, ctx) => {
  await connectDB();
  const { id } = await ctx.params;

  const doc = await GeneralPrayerTiming.findById(id);
  if (!doc) {
    return Response.json(
      { success: false, message: "Not found" },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: doc });
});

export const PUT = withAuth("super_admin", async (req, ctx, user) => {
  await connectDB();
  const { id } = await ctx.params;
  const body = await req.json();

  if (body.slots) {
    body.slots = body.slots.map((s) => ({
      name: s.name,
      time: normalizeTime(s.time, s.name),
    }));
  }

  const updated = await GeneralPrayerTiming.findByIdAndUpdate(
    id,
    { ...body, updatedAt: new Date(), updatedBy: user?._id },
    { new: true },
  );

  return Response.json({
    success: true,
    message: "Updated",
    data: updated,
  });
});

export const DELETE = withAuth("super_admin", async (req, ctx) => {
  await connectDB();
  const { id } = await ctx.params;

  await GeneralPrayerTiming.findByIdAndDelete(id);

  return Response.json({
    success: true,
    message: "Deleted",
  });
});
