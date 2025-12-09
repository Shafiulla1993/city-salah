// src/app/api/masjid-admin/masjids/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { getMyMasjidController } from "@/server/controllers/masjidAdmin/masjids.controller";

export const GET = withAuth("masjid_admin", async (request, context) => {
  const awaitedParams = await context.params;
  const id = awaitedParams.id;

  return await getMyMasjidController({
    id,
    user: context.user,
  });
});
