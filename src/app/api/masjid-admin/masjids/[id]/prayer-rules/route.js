// src/app/api/masjid-admin/masjids/[id]/prayer-rules/route.js

import mongoose from "mongoose";
import { withAuth } from "@/lib/middleware/withAuth";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";
import { parseToMinutes } from "@/lib/prayer/timeHelpers";

/**
 * Ownership check helper
 */
function assertOwnership(id, user) {
  const allowed = (user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }
  return null;
}

/**
 * GET → fetch all prayer rules for own masjid
 */
export const GET = withAuth("masjid_admin", async (_req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

  const ownershipError = assertOwnership(id, ctx.user);
  if (ownershipError) return ownershipError;

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
 * PUT → upsert ONE prayer rule (own masjid only)
 */
export const PUT = withAuth("masjid_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  const { prayer, mode, manual, auto } = await req.json();

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

  const ownershipError = assertOwnership(id, ctx.user);
  if (ownershipError) return ownershipError;

  if (!prayer || !mode) {
    return {
      status: 400,
      json: { success: false, message: "Prayer and mode are required" },
    };
  }

  // 🔒 Locked rules
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
