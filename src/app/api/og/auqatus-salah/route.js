// src/app/api/og/auqatus-salah/route.js

import { ImageResponse } from "next/og";

export const runtime = "edge";

/* 🔹 Convert 24h → 12h AM/PM */
function to12Hour(time24) {
  if (!time24) return "";
  let [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const labels = {
    fajr: "Fajr",
    ishraq: "Ishraq",
    chasht: "Chasht",
    zohar: "Zohar",
    asar_shafi: "Asar (Shafi)",
    asar_hanafi: "Asar (Hanafi)",
    maghrib: "Maghrib",
    isha: "Isha",
  };

  const rows = Object.keys(labels)
    .map((key) => {
      const time = searchParams.get(key);
      return time
        ? { name: labels[key], time: to12Hour(time) }
        : null;
    })
    .filter(Boolean);

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
          background: "linear-gradient(135deg, #020617, #0f172a)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        {/* 🔹 HEADER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 36,
          }}
        >
          <div style={{ fontSize: 54, fontWeight: 700 }}>
            Auqatus Salah
          </div>
          <div
            style={{
              fontSize: 26,
              marginTop: 8,
              opacity: 0.9,
            }}
          >
            Prayer Start Times
          </div>
        </div>

        {/* 🔹 TIMES GRID (MOBILE FRIENDLY) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18, // 👈 spacing between rows
            width: "100%",
            maxWidth: 520,
          }}
        >
          {rows.map((r) => (
            <div
              key={r.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                fontSize: 28,
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {r.name}
              </span>
              <span style={{ fontWeight: 600 }}>
                {r.time}
              </span>
            </div>
          ))}
        </div>

        {/* 🔹 FOOTER */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 22,
            opacity: 0.75,
          }}
        >
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
