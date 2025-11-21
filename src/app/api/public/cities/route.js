// src/app/api/public/cities/page.js

import { NextResponse } from "next/server";
import City from "@/models/City";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const cities = await City.find().select("name slug");
    return NextResponse.json(cities, { status: 200 });
  } catch (err) {
    console.error("Error fetching cities:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
