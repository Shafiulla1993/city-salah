// src/models/GeneralPrayerTiming.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const PrayerSchema = new Schema(
  {
    name: { type: String, required: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const GeneralPrayerTimingSchema = new Schema({
  area: { type: Schema.Types.ObjectId, ref: "Area", required: true },
  city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  madhab: { type: String, enum: ["shafi", "hanafi"], default: "shafi" },
  type: { type: String, enum: ["weekly", "date"], default: "weekly" },
  dayOfWeek: { type: Number, min: 0, max: 6 },
  date: { type: String }, // YYYY-MM-DD when type === "date"
  prayers: [PrayerSchema],
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicates per area+date+madhab
GeneralPrayerTimingSchema.index(
  { area: 1, date: 1, madhab: 1 },
  { unique: true, sparse: true }
);
GeneralPrayerTimingSchema.index({ area: 1, type: 1, dayOfWeek: 1 });

GeneralPrayerTimingSchema.plugin(auditPlugin);

export default models.GeneralPrayerTiming ||
  model("GeneralPrayerTiming", GeneralPrayerTimingSchema);
