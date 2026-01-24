// src/app/api/super-admin/masjids/[id]/prayer-rules/route.js

import mongoose from "mongoose";
import { withAuth } from "@/lib/middleware/withAuth";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { parseToMinutes } from "@/lib/prayer/timeHelpers";

/**
 * GET → fetch all prayer rules for a masjid
 */
export const GET = withAuth("super_admin", async (_req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

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
 * Helper: return "" if empty, otherwise minutes as string
 */
function safeMinutes(val) {
  const m = parseToMinutes(val);
  if (m === null || m === undefined || Number.isNaN(m)) return "";
  return String(m);
}

/**
 * PUT → upsert ONE prayer rule
 */
export const PUT = withAuth("super_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  const { prayer, mode, manual, auto } = await req.json();

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

  if (!prayer || !mode) {
    return {
      status: 400,
      json: { success: false, message: "Prayer and mode are required" },
    };
  }

  if (prayer === "maghrib" && mode !== "auto") {
    return {
      status: 400,
      json: { success: false, message: "Maghrib must be auto" },
    };
  }

  if (prayer !== "maghrib" && mode === "auto") {
    return {
      status: 400,
      json: { success: false, message: "Only Maghrib can be auto" },
    };
  }

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
            azan: safeMinutes(manual?.azan),
            iqaamat: safeMinutes(manual?.iqaamat),
          },
        };

  const updated = await MasjidPrayerConfig.findOneAndUpdate(
    { masjid: id, "rules.prayer": prayer },
    { $set: { "rules.$": rule } },
    { new: true },
  );

  if (!updated) {
    await MasjidPrayerConfig.findOneAndUpdate(
      { masjid: id },
      { $push: { rules: rule } },
      { upsert: true },
    );
  }

  return { status: 200, json: { success: true } };
});
