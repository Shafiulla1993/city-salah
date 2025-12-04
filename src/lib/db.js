import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGO_URI is missing in .env file");
}

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI);

    isConnected = conn.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected");

    await import("@/models/City");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
