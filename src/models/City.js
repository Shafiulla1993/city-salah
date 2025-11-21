// src/models/City.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const CitySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, trim: true },
  timezone: { type: String, default: "Asia/Kolkata" },
  createdAt: { type: Date, default: Date.now },
});

CitySchema.plugin(auditPlugin);

export default models.City || model("City", CitySchema);
