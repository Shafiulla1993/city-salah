// src/models/ThoughtOfDay.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const ThoughtOfDaySchema = new Schema({
  text: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, ref: "City" },
  area: { type: Schema.Types.ObjectId, ref: "Area" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  displayDate: { type: String }, // optional display date like "2025-11-14"
});

ThoughtOfDaySchema.plugin(auditPlugin);

export default models.ThoughtOfDay || model("ThoughtOfDay", ThoughtOfDaySchema);
