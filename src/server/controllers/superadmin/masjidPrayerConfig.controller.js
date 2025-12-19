// src/server/controllers/superadmin/masjidPrayerConfig.controller.js

import mongoose from "mongoose";
import MasjidPrayerConfig from "@/models/MasjidPrayerConfig";

/* -----------------------------------------
 * Time Normalizer (BACKEND ONLY)
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

  const AM_PRAYERS = ["fajr"];
  const suffix = AM_PRAYERS.includes(prayer) ? "AM" : "PM";

  return `${hh}:${mm} ${suffix}`;
}

/* ======================================================
 * GET ALL RULES FOR MASJID
 * ====================================================== */
export async function getMasjidPrayerRulesController({ masjidId }) {
  if (!mongoose.isValidObjectId(masjidId)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

  const config = await MasjidPrayerConfig.findOne({ masjid: masjidId });

  return {
    status: 200,
    json: {
      success: true,
      data: config || { masjid: masjidId, rules: [] },
    },
  };
}

/* ======================================================
 * UPSERT SINGLE PRAYER RULE
 * ====================================================== */
export async function upsertMasjidPrayerRuleController({
  masjidId,
  prayer,
  mode,
  manual,
  auto,
}) {
  if (!mongoose.isValidObjectId(masjidId)) {
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
      json: {
        success: false,
        message: "Maghrib must be auto mode",
      },
    };
  }

  if (prayer !== "maghrib" && mode === "auto") {
    return {
      status: 400,
      json: {
        success: false,
        message: "Only maghrib supports auto mode",
      },
    };
  }

  const rule = {
    prayer,
    mode,
  };

  /* -----------------------------
   * MANUAL PRAYERS
   * ----------------------------- */
  if (mode === "manual") {
    rule.manual = {
      azan: normalizeTime(manual?.azan, prayer),
      iqaamat: normalizeTime(manual?.iqaamat, prayer),
    };
  }

  /* -----------------------------
   * AUTO MAGHRIB
   * ----------------------------- */
  if (mode === "auto") {
    rule.auto = {
      azanOffset: Number(auto?.azanOffset || 0),
      iqaamatOffset: Number(auto?.iqaamatOffset || 0),
    };
  }

  /* -----------------------------
   * UPSERT LOGIC
   * ----------------------------- */
  const doc = await MasjidPrayerConfig.findOneAndUpdate(
    {
      masjid: masjidId,
      "rules.prayer": prayer,
    },
    {
      $set: {
        masjid: masjidId,
        "rules.$": rule,
      },
    },
    { new: true }
  );

  // If rule does not exist → push new
  if (!doc) {
    await MasjidPrayerConfig.findOneAndUpdate(
      { masjid: masjidId },
      {
        $push: { rules: rule },
      },
      { upsert: true }
    );
  }

  return {
    status: 200,
    json: { success: true },
  };
}
