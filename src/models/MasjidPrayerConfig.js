// src/models/MasjidPrayerConfig.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const PrayerRuleSchema = new Schema(
  {
    prayer: {
      type: String,
      enum: ["fajr", "zohar", "asr", "maghrib", "isha", "juma"],
      required: true,
    },

    mode: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },

    manual: {
      azan: String,
      iqaamat: String,
    },

    auto: {
      source: {
        type: String,
        enum: ["general", "auqatus_salah"],
      },
      azan_offset_minutes: Number,
      iqaamat_offset_minutes: Number,
    },

    // ✅ NEW: cached value
    lastComputed: {
      azan: String,
      iqaamat: String,
      syncedAt: Date,
    },
  },
  { _id: false }
);

const MasjidPrayerConfigSchema = new Schema(
  {
    masjid: {
      type: Schema.Types.ObjectId,
      ref: "Masjid",
      required: true,
      unique: true,
    },

    rules: [PrayerRuleSchema],
  },
  { timestamps: true }
);

// Prevent duplicate prayer rules per masjid
MasjidPrayerConfigSchema.index(
  { masjid: 1, "rules.prayer": 1 },
  { unique: true }
);

MasjidPrayerConfigSchema.plugin(auditPlugin);

export default models.MasjidPrayerConfig ||
  model("MasjidPrayerConfig", MasjidPrayerConfigSchema);
