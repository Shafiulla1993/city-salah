import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    env: process.env.NODE_ENV,
  });
}
