// src/app/api/super-admin/masjids/route.js
import {
  createMasjidController,
  getAllMasjidsController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";

/**
 * GET /super-admin/masjids
 * Query: page, limit, search, cityId, areaId
 */
export const GET = withAuth("super_admin", async (request) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  return await getAllMasjidsController({ query });
});

/**
 * CREATE MASJID (JSON ONLY)
 */
export const POST = withAuth("super_admin", async (request, ctx) => {
  const body = await request.json().catch(() => ({}));

  return await createMasjidController({
    body,
    user: ctx.user,
  });
});
