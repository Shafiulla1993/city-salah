// src/models/Masjid.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const ContactPersonSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["imam", "mozin", "mutawalli", "other"],
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const MasjidPrayerTimingSchema = new Schema(
  {
    fajr: { azan: String, iqaamat: String },
    Zohar: { azan: String, iqaamat: String },
    asr: { azan: String, iqaamat: String },
    maghrib: { azan: String, iqaamat: String },
    isha: { azan: String, iqaamat: String },
    juma: { azan: String, iqaamat: String },
  },
  { _id: false }
);

const MasjidSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, lowercase: true },
  address: { type: String },
  area: { type: Schema.Types.ObjectId, ref: "Area", required: true },
  city: { type: Schema.Types.ObjectId, ref: "City", required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  imageUrl: { type: String }, // Cloudinary URL
  imagePublicId: { type: String }, // Cloudinary public_id for cleanup
  contacts: [ContactPersonSchema],
  prayerTimings: [MasjidPrayerTimingSchema],
  timezone: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 2dsphere index for geospatial queries
MasjidSchema.index({ location: "2dsphere" });

// Compound unique index: slug + area (same slug allowed across different areas)
MasjidSchema.index({ slug: 1, area: 1 }, { unique: true });

// Auto-cleanup masjid references in users when masjid deleted
MasjidSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      const User = mongoose.model("User");
      await User.updateMany(
        { masjidId: doc._id },
        { $pull: { masjidId: doc._id } }
      );
      console.info(`🧹 Cleaned up masjid ${doc._id} from user masjidIds`);
    } catch (err) {
      console.error("Error cleaning up masjid refs:", err);
    }
  }
});

MasjidSchema.plugin(auditPlugin);

export default models.Masjid || model("Masjid", MasjidSchema);
