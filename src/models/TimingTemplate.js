// src/models/TimingTemplate.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const PrayerSlot = new Schema(
  {
    name: { type: String, required: true }, // e.g. 'Fajr'
    start: { type: Number, required: true }, // minutes from midnight
    end: { type: Number, required: true },   // minutes from midnight
  },
  { _id: false }
);

const TimingTemplateSchema = new Schema({
  title: { type: String, default: "" }, // human readable: "Mysore - default"
  city: { type: Schema.Types.ObjectId, ref: "City" }, // optional
  areas: [{ type: Schema.Types.ObjectId, ref: "Area" }], // optional
  prayers: [PrayerSlot], // canonical list of times (for one madhab or both: store for each madhab separately)
  madhab: { type: String, enum: ["shafi", "hanafi", "both"], default: "both" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

TimingTemplateSchema.plugin(auditPlugin);

export default models.TimingTemplate || model("TimingTemplate", TimingTemplateSchema);
