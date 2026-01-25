// src/models/ThoughtOfDay.js

import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const ThoughtOfDaySchema = new Schema({
  text: { type: String, required: true },

  // Cloudinary URLs
  images: [{ type: String }],

  // Schedule
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Lifecycle
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },

  // TTL for drafts (auto delete after 30 minutes)
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 },
  },

  // Meta
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/* ------------------------------------
   Auto-manage TTL and Archive
------------------------------------ */
ThoughtOfDaySchema.pre("save", function (next) {
  // Draft → auto delete in 30 minutes
  if (this.status === "draft") {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  } else {
    this.expiresAt = null;
  }

  // Auto-archive if endDate passed
  if (this.status === "published" && this.endDate < new Date()) {
    this.status = "archived";
  }

  next();
});

/* ------------------------------------
   Hard rule: no overlapping published thoughts
------------------------------------ */
ThoughtOfDaySchema.index({ startDate: 1, endDate: 1 }, { unique: false });

ThoughtOfDaySchema.plugin(auditPlugin);

export default models.ThoughtOfDay || model("ThoughtOfDay", ThoughtOfDaySchema);
