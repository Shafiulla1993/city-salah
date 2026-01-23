// src/app/api/super-admin/general-prayer-timings/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

/* ------------------------- LIST (BY MONTH) ------------------------- */
export const GET = withAuth("super_admin", async (req) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId");
  const areaId = searchParams.get("areaId");
  const month = searchParams.get("month"); // YYYY-MM

  if (!cityId || !month) {
    return Response.json(
      { success: false, message: "cityId & month required" },
      { status: 400 },
    );
  }

  const m = month.split("-")[1]; // "01"
  const regex = new RegExp(`^${m}-\\d{2}$`); // 01-01 ... 01-31

  const filter = {
    city: cityId,
    dayKey: { $regex: regex },
  };
  if (areaId) filter.area = areaId;

  const data = await GeneralPrayerTiming.find(filter).sort({ dayKey: 1 });

  return Response.json({ success: true, data });
});

/* ------------------------- CREATE / UPDATE ------------------------- */
export const POST = withAuth("super_admin", async (req, user) => {
  await connectDB();

  const body = await req.json();
  const { city, area, dayKey, slots } = body;

  if (!city || !dayKey || !slots?.length) {
    return Response.json(
      { success: false, message: "city, dayKey, slots required" },
      { status: 400 },
    );
  }

  const query = {
    city,
    area: area || null,
    dayKey,
  };

  let doc = await GeneralPrayerTiming.findOne(query);

  if (!doc) {
    doc = await GeneralPrayerTiming.create({
      city,
      area: area || null,
      dayKey,
      slots,
      createdBy: user?._id,
    });
  } else {
    doc.slots = slots;
    doc.updatedAt = new Date();
    doc.updatedBy = user?._id;
    await doc.save();
  }

  return Response.json({ success: true, data: doc });
});

/* ------------------------- DELETE ------------------------- */
export const DELETE = withAuth("super_admin", async (req) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!mongoose.isValidObjectId(id)) {
    return Response.json(
      { success: false, message: "Invalid ID" },
      { status: 400 },
    );
  }

  await GeneralPrayerTiming.findByIdAndDelete(id);

  return Response.json({ success: true });
});
