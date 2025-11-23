// src/models/GeneralPrayerTiming.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const PrayerSlot = new Schema(
  {
    name: { type: String, required: true }, // 'Fajr' etc
    start: { type: Number, required: true }, // minutes from midnight
    end: { type: Number, required: true },
  },
  { _id: false }
);

const GeneralPrayerTimingSchema = new Schema({
  city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  area: { type: Schema.Types.ObjectId, ref: "Area", required: true },
  madhab: { type: String, enum: ["shafi", "hanafi"], default: "shafi" },
  type: { type: String, enum: ["date", "weekly"], default: "date" },
  date: { type: String }, // YYYY-MM-DD when type === "date"
  dayOfWeek: { type: Number, min: 0, max: 6 }, // when type === "weekly"
  prayers: [PrayerSlot], // explicit prayers for this doc (optional if using templateId)
  templateId: { type: Schema.Types.ObjectId, ref: "TimingTemplate" }, // optional reference
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  editedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

// unique per area+date+madhab
GeneralPrayerTimingSchema.index({ area: 1, date: 1, madhab: 1 }, { unique: true, sparse: true });
GeneralPrayerTimingSchema.index({ area: 1, type: 1, dayOfWeek: 1 });

GeneralPrayerTimingSchema.plugin(auditPlugin);

export default models.GeneralPrayerTiming || model("GeneralPrayerTiming", GeneralPrayerTimingSchema);
