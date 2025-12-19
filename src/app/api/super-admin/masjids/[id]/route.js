// src/app/api/super-admin/masjids/[id]/route.js

import {
  getMasjidController,
  updateMasjidController,
  deleteMasjidController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";

/**
 * GET /super-admin/masjids/:id
 */
export const GET = withAuth("super_admin", async (_req, ctx) => {
  const { id } = await ctx.params;
  return await getMasjidController({ id });
});

/**
 * UPDATE MASJID (JSON ONLY)
 */
export const PUT = withAuth("super_admin", async (request, ctx) => {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  return await updateMasjidController({
    id,
    body,
  });
});

/**
 * DELETE /super-admin/masjids/:id
 */
export const DELETE = withAuth("super_admin", async (_req, ctx) => {
  const { id } = await ctx.params;
  return await deleteMasjidController({ id });
});
