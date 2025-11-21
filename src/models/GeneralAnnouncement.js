// src/models/GeneralAnnouncement.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const GeneralAnnouncementSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, ref: "City" },
  area: { type: Schema.Types.ObjectId, ref: "Area" },
  images: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
});

// TTL index to let MongoDB auto-expire documents when expiresAt is set
GeneralAnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

GeneralAnnouncementSchema.plugin(auditPlugin);

export default models.GeneralAnnouncement ||
  model("GeneralAnnouncement", GeneralAnnouncementSchema);
