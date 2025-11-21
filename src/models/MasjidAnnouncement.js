// src/models/MasjidAnnouncement.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const MasjidAnnouncementSchema = new Schema({
  masjidId: { type: Schema.Types.ObjectId, ref: "Masjid", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  images: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
});

// TTL index for auto-expiration when expiresAt is set
MasjidAnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

MasjidAnnouncementSchema.plugin(auditPlugin);

export default models.MasjidAnnouncement ||
  model("MasjidAnnouncement", MasjidAnnouncementSchema);
