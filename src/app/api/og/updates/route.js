//  src/app/api/og/updates/route.js

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const masjid = searchParams.get("masjid");

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
          fontFamily: "sans-serif",
          padding: 60,
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 800 }}>
          CitySalah Updates
        </div>

        <div style={{ fontSize: 30, marginTop: 20 }}>
          {masjid ? `Masjid: ${masjid}` : "Community Announcements"}
        </div>

        <div style={{ marginTop: 40, fontSize: 22, opacity: 0.75 }}>
          CitySalah.in
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
