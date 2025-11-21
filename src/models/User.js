// src/models/User.js
import mongoose, { Schema, models, model } from "mongoose";
import auditPlugin from "@/lib/utils/auditPlugin";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String, required: true, unique: true, trim: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["public", "masjid_admin", "super_admin"],
      default: "public",
    },

    city: { type: Schema.Types.ObjectId, ref: "City", required: true },
    area: { type: Schema.Types.ObjectId, ref: "Area", required: true },

    masjidId: [{ type: Schema.Types.ObjectId, ref: "Masjid", default: [] }],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.plugin(auditPlugin);

export default models.User || model("User", UserSchema);
