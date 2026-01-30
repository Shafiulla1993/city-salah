// src/app/api/super-admin/hijri-settings/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import HijriSetting from "@/models/HijriSetting";

// GET  /api/super-admin/hijri-settings
// POST /api/super-admin/hijri-settings
export const GET = withAuth("super_admin", async () => {
  await connectDB();

  const settings = await HijriSetting.find()
    .populate("city", "name slug")
    .populate("area", "name slug")
    .lean();

  return {
    status: 200,
    json: {
      success: true,
      data: settings,
    },
  };
});

export const POST = withAuth("super_admin", async (request) => {
  await connectDB();

  const body = await request.json().catch(() => ({}));
  const { scope, city, area, hijriOffset } = body;

  if (!["global", "city", "area"].includes(scope)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid scope" },
    };
  }

  if (scope === "city" && !city) {
    return {
      status: 400,
      json: { success: false, message: "City is required" },
    };
  }

  if (scope === "area" && !area) {
    return {
      status: 400,
      json: { success: false, message: "Area is required" },
    };
  }

  const setting = await HijriSetting.findOneAndUpdate(
    { scope, city: city || null, area: area || null },
    { hijriOffset },
    { upsert: true, new: true },
  );

  return {
    status: 200,
    json: {
      success: true,
      message: "Hijri setting saved",
      data: setting,
    },
  };
});
