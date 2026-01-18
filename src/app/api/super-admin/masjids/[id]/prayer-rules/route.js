// src/app/api/super-admin/masjids/[id]/prayer-rules/route.js

import mongoose from "mongoose";
import { withAuth } from "@/lib/middleware/withAuth";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { normalizeTime } from "@/lib/helpers/normalizeTime";

/**
 * GET → fetch all prayer rules for a masjid
 */
export const GET = withAuth("super_admin", async (_req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id))
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };

  const config = await MasjidPrayerConfig.findOne({ masjid: id });

  return {
    status: 200,
    json: {
      success: true,
      data: config || { masjid: id, rules: [] },
    },
  };
});

/**
 * PUT → upsert ONE prayer rule
 * body:
 * {
 *   prayer,
 *   mode,
 *   manual?: { azan, iqaamat },
 *   auto?: { azan_offset_minutes, iqaamat_offset_minutes }
 * }
 */
export const PUT = withAuth("super_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  const { prayer, mode, manual, auto } = await req.json();

  if (!mongoose.isValidObjectId(id))
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };

  if (!prayer || !mode)
    return {
      status: 400,
      json: { success: false, message: "Prayer and mode are required" },
    };

  if (prayer === "maghrib" && mode !== "auto")
    return {
      status: 400,
      json: { success: false, message: "Maghrib must be auto" },
    };

  if (prayer !== "maghrib" && mode === "auto")
    return {
      status: 400,
      json: { success: false, message: "Only Maghrib can be auto" },
    };

  const rule =
    mode === "auto"
      ? {
          prayer,
          mode: "auto",
          auto: {
            source: "auqatus_salah",
            azan_offset_minutes: Number(auto?.azan_offset_minutes || 0),
            iqaamat_offset_minutes: Number(auto?.iqaamat_offset_minutes || 0),
          },
        }
      : {
          prayer,
          mode: "manual",
          manual: {
            azan: normalizeTime(manual?.azan, prayer),
            iqaamat: normalizeTime(manual?.iqaamat, prayer),
          },
        };

  const doc = await MasjidPrayerConfig.findOneAndUpdate(
    { masjid: id, "rules.prayer": prayer },
    { $set: { "rules.$": rule } },
    { new: true },
  );

  if (!doc) {
    await MasjidPrayerConfig.findOneAndUpdate(
      { masjid: id },
      { $push: { rules: rule } },
      { upsert: true },
    );
  }

  return { status: 200, json: { success: true } };
});
