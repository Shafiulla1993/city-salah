// src/app/api/super-admin/hijri-settings/[id]/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import HijriSetting from "@/models/HijriSetting";

export const DELETE = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  await HijriSetting.findByIdAndDelete(id);

  return {
    status: 200,
    json: {
      success: true,
      message: "Hijri setting removed",
    },
  };
});
