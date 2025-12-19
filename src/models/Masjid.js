// src/models/Masjid

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";
import { generateSlug } from "@/lib/helpers/slugHelper";

const ContactSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["imam", "mozin", "mutawalli", "other"],
      required: true,
    },
    name: { type: String, required: true },
    phone: String,
    email: String,
    note: String,
  },
  { _id: false }
);

const MasjidSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true },

    address: String,

    city: { type: Schema.Types.ObjectId, ref: "City", required: true },
    area: { type: Schema.Types.ObjectId, ref: "Area", required: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
    },

    contacts: [ContactSchema],

    imageUrl: String,
    imagePublicId: String,

    timezone: { type: String, default: "Asia/Kolkata" },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

/* Indexes */
MasjidSchema.index({ location: "2dsphere" });
MasjidSchema.index({ slug: 1, area: 1 }, { unique: true });

MasjidSchema.pre("validate", function (next) {
  if (!this.slug && this.name) this.slug = generateSlug(this.name);
  next();
});

MasjidSchema.plugin(auditPlugin);

export default models.Masjid || model("Masjid", MasjidSchema);
