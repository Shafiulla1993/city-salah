// src/app/api/super-admin/masjids/[id]/can-delete/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";

export const GET = withAuth("super_admin", async (_req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id))
    return { status: 400, json: { success: false, message: "Invalid ID" } };

  const prayerConfig = await MasjidPrayerConfig.findOne({ masjid: id });

  const canDelete = true; // extend later for announcements, attendance, etc.

  return {
    status: 200,
    json: {
      success: true,
      canDelete,
      blockers: prayerConfig ? [] : [],
    },
  };
});
