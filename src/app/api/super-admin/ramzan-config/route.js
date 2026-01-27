// src/app/api/super-admin/ramzan-config/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import RamzanConfig from "@/models/RamzanConfig";

/* ------------------------- GET (ACTIVE) ------------------------- */
export const GET = withAuth("super_admin", async (req) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const area = searchParams.get("area");

  if (!city) {
    return Response.json(
      { success: false, message: "city is required" },
      { status: 400 },
    );
  }

  const filter = { city, active: true };
  if (area) filter.area = area;
  else filter.area = null;

  const config = await RamzanConfig.findOne(filter);

  return Response.json({ success: true, data: config });
});

/* ------------------------- CREATE / UPDATE ------------------------- */
export const POST = withAuth("super_admin", async (req, user) => {
  await connectDB();

  const {
    city,
    area,
    sourceCity,
    sourceArea,
    startDate,
    endDate,
    iftarOffsetMinutes = 3,
  } = await req.json();

  if (!city || !sourceCity || !startDate || !endDate) {
    return Response.json(
      { success: false, message: "Missing required fields" },
      { status: 400 },
    );
  }

  const query = {
    city,
    area: area || null,
    active: true,
  };

  let doc = await RamzanConfig.findOne(query);

  if (!doc) {
    doc = await RamzanConfig.create({
      city,
      area: area || null,
      sourceCity,
      sourceArea: sourceArea || null,
      startDate,
      endDate,
      iftarOffsetMinutes,
      active: true,
      createdBy: user?._id,
    });
  } else {
    doc.sourceCity = sourceCity;
    doc.sourceArea = sourceArea || null;
    doc.startDate = startDate;
    doc.endDate = endDate;
    doc.iftarOffsetMinutes = iftarOffsetMinutes;
    doc.updatedAt = new Date();
    doc.updatedBy = user?._id;
    await doc.save();
  }

  return Response.json({ success: true, data: doc });
});

/* ------------------------- DEACTIVATE ------------------------- */
export const DELETE = withAuth("super_admin", async (req) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json(
      { success: false, message: "id is required" },
      { status: 400 },
    );
  }

  const doc = await RamzanConfig.findByIdAndUpdate(
    id,
    { active: false, updatedAt: new Date() },
    { new: true },
  );

  return Response.json({ success: true, data: doc });
});
