import mongoose from "mongoose";

const MasjidSchema = new mongoose.Schema(
  {
    name: String,
    prayerTimings: Array,
  },
  { strict: false }
);

export default mongoose.models.Masjid || mongoose.model("Masjid", MasjidSchema);
