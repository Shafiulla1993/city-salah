// src/models/GeneralPrayerTiming.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

/* Inline Slot Schema */
const SlotSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "fajr_start"
    time: { type: Number, required: true }, // minutes from midnight
  },
  { _id: false },
);

const GeneralPrayerTimingSchema = new Schema({
  city: {
    type: Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  area: {
    type: Schema.Types.ObjectId,
    ref: "Area",
    default: null,
  },

  // "01-19"
  dayKey: { type: String, required: true },

  slots: [SlotSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

GeneralPrayerTimingSchema.index(
  { city: 1, area: 1, dayKey: 1 },
  { unique: true },
);

GeneralPrayerTimingSchema.plugin(auditPlugin);

export default models.GeneralPrayerTiming ||
  model("GeneralPrayerTiming", GeneralPrayerTimingSchema);
