// src/models/common/Slot.js

import { Schema } from "mongoose";

export const SlotSchema = new Schema(
  {
    name: { type: String, required: true }, // 'Fajr start'
    time: { type: Number, required: true }, // minutes from midnight
  },
  { _id: false }
);
