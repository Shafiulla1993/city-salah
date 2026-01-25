// src/app/api/masjid-admin/masjids/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import Masjid from "@/models/Masjid";

export const GET = withAuth("masjid_admin", async (_req, ctx) => {
  const allowedIds = (ctx.user.masjidId || []).map(String);

  const masjids = await Masjid.find({ _id: { $in: allowedIds } })
    .populate("city", "name")
    .populate("area", "name")
    .lean();

  return {
    status: 200,
    json: { success: true, data: masjids },
  };
});
