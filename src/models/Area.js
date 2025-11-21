// src/models/Area.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const AreaSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, trim: true }, // uniqueness enforced per-city in controller logic
  city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  center: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true, default: [0, 0] }, // [lng, lat]
  },
  createdAt: { type: Date, default: Date.now },
});

// Compound unique index per city + slug
AreaSchema.index({ city: 1, slug: 1 }, { unique: true });

AreaSchema.plugin(auditPlugin);

export default models.Area || model("Area", AreaSchema);
