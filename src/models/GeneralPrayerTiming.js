// src/models/GeneralPrayerTiming.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

/* ----------------- Inline Schemas ----------------- */

const SlotSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "fajr_start"
    time: { type: Number, required: true }, // minutes from midnight
  },
  { _id: false },
);

const HijriSchema = new Schema(
  {
    day: { type: Number }, // 1..30
    month: { type: Number }, // 1..12
    year: { type: Number }, // 1446, 1447...
    monthName: { type: String }, // "Ramadan"
    iso: { type: String }, // "1447-09-01"
  },
  { _id: false },
);

/* ----------------- Main Schema ----------------- */

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

  // "MM-DD" (e.g. "01-19")
  dayKey: { type: String, required: true },

  // 🆕 Hijri info (cached from PrayTimes with offset)
  hijri: HijriSchema,

  // 🆕 Roza number (1..30) only if hijri.month === 9, else null
  rozaNumber: { type: Number, default: null },

  // Auqatus slots (minutes from midnight)
  slots: [SlotSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

/* ----------------- Indexes ----------------- */

GeneralPrayerTimingSchema.index(
  { city: 1, area: 1, dayKey: 1 },
  { unique: true },
);

/* ----------------- Plugins ----------------- */

GeneralPrayerTimingSchema.plugin(auditPlugin);

/* ----------------- Export ----------------- */

export default models.GeneralPrayerTiming ||
  model("GeneralPrayerTiming", GeneralPrayerTimingSchema);
