// src/models/GeneralAnnouncement.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const GeneralAnnouncementSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },

  // Targets (empty = global)
  cities: [{ type: Schema.Types.ObjectId, ref: "City" }],
  areas: [{ type: Schema.Types.ObjectId, ref: "Area" }],
  masjids: [{ type: Schema.Types.ObjectId, ref: "Masjid" }],

  // Cloudinary URLs
  images: [{ type: String }],

  // Schedule
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Draft / Publish
  status: {
    type: String,
    enum: ["draft", "published"],
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

// Automatically manage expiresAt based on status
GeneralAnnouncementSchema.pre("save", function (next) {
  if (this.status === "draft") {
    // 30 minutes TTL
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  } else {
    // Published = no auto delete
    this.expiresAt = null;
  }
  next();
});

GeneralAnnouncementSchema.plugin(auditPlugin);

export default models.GeneralAnnouncement ||
  model("GeneralAnnouncement", GeneralAnnouncementSchema);
