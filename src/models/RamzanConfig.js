// src/models/RamzanConfig.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const RamzanConfigSchema = new Schema({
  city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  area: { type: Schema.Types.ObjectId, ref: "Area", default: null },

  sourceCity: { type: Schema.Types.ObjectId, ref: "City", required: true },
  sourceArea: { type: Schema.Types.ObjectId, ref: "Area", default: null },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  iftarOffsetMinutes: { type: Number, default: 3 },

  active: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

RamzanConfigSchema.index(
  { city: 1, area: 1, active: 1 },
  { unique: true, partialFilterExpression: { active: true } },
);

RamzanConfigSchema.plugin(auditPlugin);

export default models.RamzanConfig || model("RamzanConfig", RamzanConfigSchema);
