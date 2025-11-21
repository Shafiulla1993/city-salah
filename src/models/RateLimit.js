import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
  lastRequest: { type: Number, required: true },
});

export default mongoose.models.RateLimit ||
  mongoose.model("RateLimit", RateLimitSchema);
