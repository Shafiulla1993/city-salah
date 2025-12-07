// src/models/ThoughtOfDay.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const ThoughtOfDaySchema = new Schema({
  text: { type: String, required: true },

  images: [{ type: String }], // Cloudinary URLs

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ThoughtOfDaySchema.plugin(auditPlugin);

export default models.ThoughtOfDay || model("ThoughtOfDay", ThoughtOfDaySchema);
