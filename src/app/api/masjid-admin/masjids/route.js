// src/app/api/masjid-admin/masjids/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { getMyMasjidsController } from "@/server/controllers/masjidAdmin/masjids.controller";

export const GET = withAuth("masjid_admin", async (request, context) => {
  return await getMyMasjidsController({ user: context.user });
});
