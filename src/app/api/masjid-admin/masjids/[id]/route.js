// src/app/api/masjid-admin/masjids/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { getMasjidAdminViewController } from "@/server/controllers/masjidAdmin/masjids.controller";

export const GET = withAuth("masjid_admin", async (_req, ctx) => {
  const { id } = await ctx.params;
  return await getMasjidAdminViewController({
    id,
    user: ctx.user,
  });
});
