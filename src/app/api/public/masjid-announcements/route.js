// src/app/api/public/masjid-announcements/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MasjidAnnouncement from "@/models/MasjidAnnouncement";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const masjidId = searchParams.get("masjidId");

    if (!masjidId) {
      return NextResponse.json(
        { message: "Masjid ID is required" },
        { status: 400 }
      );
    }

    const announcements = await MasjidAnnouncement.find({ masjidId })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(announcements);
  } catch (err) {
    console.error("Failed to fetch masjid announcements:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
