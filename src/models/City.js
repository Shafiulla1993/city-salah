// src/models/City.js
import mongoose from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, trim: true },
  timezone: { type: String, default: "Asia/Kolkata" },

  coords: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },

  createdAt: { type: Date, default: Date.now },
});

CitySchema.plugin(auditPlugin);

export default mongoose.models.City || mongoose.model("City", CitySchema);
