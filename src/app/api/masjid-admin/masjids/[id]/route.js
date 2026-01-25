// src/app/api/masjid-admin/masjids/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";

export const GET = withAuth("masjid_admin", async (_req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const allowed = (ctx.user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }

  const masjid = await Masjid.findById(id).populate("city area").lean();
  if (!masjid) {
    return {
      status: 404,
      json: { success: false, message: "Masjid not found" },
    };
  }

  return {
    status: 200,
    json: { success: true, data: masjid },
  };
});
