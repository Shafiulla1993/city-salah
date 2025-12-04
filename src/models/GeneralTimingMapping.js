// src/models/GeneralTimingMapping.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const OffsetsSchema = new Schema(
  {
    global: { type: Number, default: 0 },
    perSlot: { type: Object, default: {} }, // { "Fajr start": 1 }
  },
  { _id: false }
);

const GeneralTimingMappingSchema = new Schema({
  scope: { type: String, enum: ["city", "area"], required: true },
  city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  area: { type: Schema.Types.ObjectId, ref: "Area" },
  template: {
    type: Schema.Types.ObjectId,
    ref: "GeneralTimingTemplate",
    required: true,
  },
  offsets: { type: OffsetsSchema, default: () => ({}) },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

GeneralTimingMappingSchema.index(
  { scope: 1, city: 1, area: 1 },
  { unique: true }
);

GeneralTimingMappingSchema.plugin(auditPlugin);

export default models.GeneralTimingMapping ||
  model("GeneralTimingMapping", GeneralTimingMappingSchema);
