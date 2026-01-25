// src/app/api/masjid-admin/masjids/[id]/update/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import Masjid from "@/models/Masjid";

export const PUT = withAuth("masjid_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();

  if (!mongoose.isValidObjectId(id)) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const allowed = (ctx.user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }

  const update = {
    address: body.address,
    contacts: body.contacts || [],
    // ❌ location intentionally NOT allowed
  };

  const masjid = await Masjid.findByIdAndUpdate(id, update, {
    new: true,
  }).lean();

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
