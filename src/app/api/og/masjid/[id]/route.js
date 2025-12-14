// src/app/api/og/masjid/[id]/route.js

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name") || "Masjid";
  const area = searchParams.get("area") || "";
  const city = searchParams.get("city") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg,#020617,#0f172a)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          padding: 60,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800 }}>{name}</div>

        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.85 }}>
          {[area, city].filter(Boolean).join(", ")}
        </div>

        <div style={{ marginTop: 40, fontSize: 22, opacity: 0.75 }}>
          CitySalah.in
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
