// src/models/GeneralTimingTemplate.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";
import { SlotSchema } from "./common/Slot";

const TemplateDaySchema = new Schema(
  {
    dateKey: { type: String, required: true }, // '03-12'
    slots: [SlotSchema],
  },
  { _id: false }
);

const GeneralTimingTemplateSchema = new Schema({
  name: { type: String, unique: true, required: true },
  timezone: { type: String, default: "Asia/Kolkata" },
  recurrence: {
    type: String,
    enum: ["recurring", "year-specific"],
    default: "recurring",
  },
  year: { type: Number },

  days: [TemplateDaySchema], // 365 rows

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

GeneralTimingTemplateSchema.plugin(auditPlugin);

export default models.GeneralTimingTemplate ||
  model("GeneralTimingTemplate", GeneralTimingTemplateSchema);
