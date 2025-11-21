import { NextResponse } from "next/server";
import moment from "moment-timezone";
import connectDB from "@/lib/db";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";

export async function POST(request) {
  try {
    await connectDB();
    const { cityId, areaId, madhab = "shafi" } = await request.json();

    if (!cityId || !areaId)
      return NextResponse.json(
        { message: "cityId and areaId are required" },
        { status: 400 }
      );

    const timezone = "Asia/Kolkata";
    const todayDate = moment().tz(timezone).format("YYYY-MM-DD");
    const dayOfWeek = moment().tz(timezone).day();

    let timing = await GeneralPrayerTiming.findOne({
      area: areaId,
      city: cityId,
      date: todayDate,
      madhab,
    })
      .populate("area", "name")
      .populate("city", "name");

    if (!timing) {
      timing = await GeneralPrayerTiming.findOne({
        area: areaId,
        city: cityId,
        dayOfWeek,
        type: "weekly",
        madhab,
      })
        .populate("area", "name")
        .populate("city", "name");
    }

    if (!timing)
      return NextResponse.json(
        { message: "No prayer timings found" },
        { status: 404 }
      );

    return NextResponse.json({
      city: timing.city.name,
      area: timing.area.name,
      madhab: timing.madhab,
      date: timing.date || todayDate,
      prayers: timing.prayers,
    });
  } catch (err) {
    console.error("Prayer timings error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
