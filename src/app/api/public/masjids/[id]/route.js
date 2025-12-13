// src/app/api/public/masjids/[id]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectDB();

    // -----------------------------
    // Read identifier from URL
    // -----------------------------
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const identifier = parts[parts.length - 1];

    if (!identifier) {
      return NextResponse.json(
        { message: "Masjid identifier is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Decide: _id or slug
    // -----------------------------
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    const query = isObjectId
      ? { _id: identifier }
      : { slug: identifier };

    // -----------------------------
    // Fetch masjid
    // -----------------------------
    const masjid = await Masjid.findOne(query)
      .populate("city", "name timezone")
      .populate("area", "name")
      .lean();

    if (!masjid) {
      return NextResponse.json(
        { message: "Masjid not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(masjid, { status: 200 });
  } catch (err) {
    console.error("Error fetching masjid:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
