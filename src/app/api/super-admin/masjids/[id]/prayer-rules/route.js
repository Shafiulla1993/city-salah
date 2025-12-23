// src/app/api/super-admin/masjids/[id]/prayer-rules/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import {
  upsertMasjidPrayerRuleController,
  getMasjidPrayerRulesController,
} from "@/server/controllers/superadmin/masjidPrayerConfig.controller";

/**
 * GET → fetch all prayer rules for a masjid
 */
export const GET = withAuth("super_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  return await getMasjidPrayerRulesController({ masjidId: id });
});

/**
 * PUT → upsert ONE prayer rule
 * body:
 * {
 *   prayer: "fajr" | "zohar" | "asr" | "isha" | "maghrib",
 *   mode: "manual" | "auto",
 *   manual?: { azan, iqaamat },
 *   auto?: { azan_offset_minutes, iqaamat_offset_minutes }
 * }
 */
export const PUT = withAuth("super_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  return await upsertMasjidPrayerRuleController({
    masjidId: id,
    ...body,
  });
});
