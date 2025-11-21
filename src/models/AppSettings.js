// src/models/AppSettings.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const AppSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});

AppSettingsSchema.plugin(auditPlugin);

export default models.AppSettings || model("AppSettings", AppSettingsSchema);
