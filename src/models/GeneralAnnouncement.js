// src/models/GeneralAnnouncement.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const GeneralAnnouncementSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },

  // Targets: arrays so one announcement can target multiple cities/areas/masjids.
  cities: [{ type: Schema.Types.ObjectId, ref: "City" }],
  areas: [{ type: Schema.Types.ObjectId, ref: "Area" }],
  masjids: [{ type: Schema.Types.ObjectId, ref: "Masjid" }],

  images: [{ type: String }], // Cloudinary URLs

  // Scheduling
  startDate: { type: Date, required: true }, // when announcement becomes active
  endDate: { type: Date, required: true },   // when announcement becomes inactive

  // meta
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now },

  // soft / manual flags (optional) - kept for admin UI
  active: { type: Boolean, default: true }, // admin can toggle; computed by date on read
});

GeneralAnnouncementSchema.plugin(auditPlugin);

export default models.GeneralAnnouncement ||
  model("GeneralAnnouncement", GeneralAnnouncementSchema);
