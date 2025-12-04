// src/models/GeneralPrayerTiming.js

import mongoose, { Schema, models, model } from "mongoose";
import { SlotSchema } from "./common/Slot";
import auditPlugin from "@/lib/utils/auditPlugin";

/**
 * Cached / resolved timings for specific day
 * Created automatically from template + mapping
 * or can be edited manually by super-admin if needed later.
 */
const GeneralPrayerTimingSchema = new Schema({
  // either area OR city is required
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Area",
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },

  date: { type: String, required: true }, // YYYY-MM-DD

  /**
   * If super-admin edits this later, we set source="manual".
   * Until then, values generated from template have source="template".
   */
  source: { type: String, enum: ["template", "manual"], default: "template" },

  slots: [SlotSchema], // [{ name, time }]

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

// Unique per day per area
GeneralPrayerTimingSchema.index(
  { city: 1, area: 1, date: 1 },
  { unique: true }
);

GeneralPrayerTimingSchema.plugin(auditPlugin);

export default models.GeneralPrayerTiming ||
  model("GeneralPrayerTiming", GeneralPrayerTimingSchema);
