import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    const announcements = await GeneralAnnouncement.find({
      $or: [{ expiresAt: { $gte: now } }, { expiresAt: null }],
    })
      .populate("city area", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(announcements);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
