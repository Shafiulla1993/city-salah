import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Masjid from "@/models/Masjid";
import City from "@/models/City";
import Area from "@/models/Area";

export async function GET(request) {
  try {
    await connectDB();

    // Read ID manually from URL path
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];

    console.log("PARAM ID:", id);

    if (!id) {
      return NextResponse.json(
        { message: "Masjid ID is required" },
        { status: 400 }
      );
    }

    const masjid = await Masjid.findById(id)
      .populate("city", "name timezone")
      .populate("area", "name")
      .lean();

    if (!masjid) {
      return NextResponse.json(
        { message: "Masjid not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(masjid);
  } catch (err) {
    console.error("Error fetching masjid:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
