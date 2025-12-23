// src/server/controllers/masjidAdmin/masjidPrayerConfig.controller.js

import mongoose from "mongoose";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";

/* -----------------------------------------
 * SAME NORMALIZER (DO NOT SHARE FILE)
 * ----------------------------------------- */
function normalizeTime(input, prayer) {
  if (!input) return "";
  let str = String(input).trim().replace(".", ":");
  let [h, m = "00"] = str.split(":");

  let hour = parseInt(h, 10);
  let minute = parseInt(m, 10) || 0;
  if (Number.isNaN(hour)) return "";

  hour = hour % 12 || 12;
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  const suffix = prayer === "fajr" ? "AM" : "PM";
  return `${hh}:${mm} ${suffix}`;
}

/* ======================================================
 * UPSERT SINGLE PRAYER RULE (MASJID ADMIN)
 * ====================================================== */
export async function upsertMasjidAdminPrayerRuleController({
  masjidId,
  prayer,
  mode,
  manual,
  auto,
  user,
}) {
  if (!mongoose.isValidObjectId(masjidId)) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const allowed = (user.masjidId || []).map(String);
  if (!allowed.includes(String(masjidId))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }

  if (prayer === "maghrib" && mode !== "auto") {
    return {
      status: 400,
      json: { success: false, message: "Maghrib must be auto" },
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
            azan: normalizeTime(manual?.azan, prayer),
            iqaamat: normalizeTime(manual?.iqaamat, prayer),
          },
        };

  const doc = await MasjidPrayerConfig.findOneAndUpdate(
    { masjid: masjidId, "rules.prayer": prayer },
    { $set: { "rules.$": rule } },
    { new: true }
  );

  if (!doc) {
    await MasjidPrayerConfig.findOneAndUpdate(
      { masjid: masjidId },
      { $push: { rules: rule } },
      { upsert: true }
    );
  }

  return { status: 200, json: { success: true } };
}
