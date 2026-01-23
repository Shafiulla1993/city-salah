// src/app/api/super-admin/general-prayer-timings/clone/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

export const POST = withAuth("super_admin", async (req, user) => {
  await connectDB();

  const {
    sourceCity,
    sourceArea,
    targetCity,
    targetArea,
    offsetMinutes = 0,
  } = await req.json();

  if (!sourceCity || !targetCity) {
    return Response.json(
      { success: false, message: "Source and Target city required" },
      { status: 400 },
    );
  }

  const sourceFilter = {
    city: sourceCity,
    area: sourceArea || null,
  };

  const sourceDocs = await GeneralPrayerTiming.find(sourceFilter);

  if (!sourceDocs.length) {
    return Response.json(
      { success: false, message: "No timings found to clone" },
      { status: 404 },
    );
  }

  const ops = sourceDocs.map((doc) => {
    const newSlots = doc.slots.map((s) => ({
      name: s.name,
      time: s.time + Number(offsetMinutes),
    }));

    return {
      updateOne: {
        filter: {
          city: targetCity,
          area: targetArea || null,
          dayKey: doc.dayKey,
        },
        update: {
          city: targetCity,
          area: targetArea || null,
          dayKey: doc.dayKey,
          slots: newSlots,
          updatedAt: new Date(),
          updatedBy: user?._id,
        },
        upsert: true,
      },
    };
  });

  await GeneralPrayerTiming.bulkWrite(ops);

  return Response.json({
    success: true,
    message: "Timings cloned with offset",
    total: ops.length,
  });
});
