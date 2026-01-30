// src/models/HijriSetting.js

import { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const HijriSettingSchema = new Schema(
  {
    // scope of this offset
    scope: {
      type: String,
      enum: ["global", "city", "area"],
      default: "global",
      required: true,
      index: true,
    },

    // optional targets (used based on scope)
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      default: null,
      index: true,
    },

    area: {
      type: Schema.Types.ObjectId,
      ref: "Area",
      default: null,
      index: true,
    },

    hijriOffset: {
      type: Number,
      default: 0, // -2 .. +2
      min: -2,
      max: 2,
      required: true,
    },
  },
  { timestamps: true },
);

// enforce uniqueness per scope target
HijriSettingSchema.index({ scope: 1, city: 1, area: 1 }, { unique: true });

HijriSettingSchema.plugin(auditPlugin);

export default models.HijriSetting || model("HijriSetting", HijriSettingSchema);
