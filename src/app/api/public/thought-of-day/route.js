import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ThoughtOfDay from "@/models/ThoughtOfDay";

export async function GET() {
  try {
    await connectDB();
    const todayThoughts = await ThoughtOfDay.find()
      .sort({ createdAt: -1 })
      .limit(1);

    return NextResponse.json(todayThoughts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
