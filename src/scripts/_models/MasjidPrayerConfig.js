import mongoose from "mongoose";

const MasjidPrayerConfigSchema = new mongoose.Schema(
  {
    masjid: { type: mongoose.Schema.Types.ObjectId, ref: "Masjid" },
    rules: Array,
  },
  { timestamps: true }
);

export default mongoose.models.MasjidPrayerConfig ||
  mongoose.model("MasjidPrayerConfig", MasjidPrayerConfigSchema);
