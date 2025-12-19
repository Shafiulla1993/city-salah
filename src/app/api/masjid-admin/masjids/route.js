// src/app/api/masjid-admin/masjids/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { getMyMasjidsController } from "@/server/controllers/masjidAdmin/masjids.controller";

export const GET = withAuth("masjid_admin", async (req, ctx) => {
  return await getMyMasjidsController({ user: ctx.user });
});
