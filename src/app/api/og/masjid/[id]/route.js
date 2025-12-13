// src/app/api/og/masjid/[id]/route.js

import { ImageResponse } from "next/og";

export const runtime = "edge";

/* ---------------------------------------
   Helpers
--------------------------------------- */
function formatTime(t) {
  return t && typeof t === "string" ? t : "--";
}

function getSiteUrl() {
  // ✅ Works in local, preview, production
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/* ---------------------------------------
   OG Route
--------------------------------------- */
export async function GET(req, { params }) {
  const id = params?.id;

  /* ---------- Safety: missing id ---------- */
  if (!id) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#020617",
            color: "#ffffff",
            fontSize: 36,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          CitySalah — Masjid Not Found
        </div>
      ),
      { width: 1080, height: 1920 }
    );
  }

  /* ---------- Fetch masjid (ABSOLUTE URL) ---------- */
  const SITE_URL = getSiteUrl();

  let masjid;
  try {
    const res = await fetch(
      `${SITE_URL}/api/public/masjids/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Fetch failed");

    masjid = await res.json();
  } catch (err) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#020617",
            color: "#ffffff",
            fontSize: 36,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          CitySalah — Masjid Not Found
        </div>
      ),
      { width: 1080, height: 1920 }
    );
  }

  /* ---------- Data ---------- */
  const name = masjid.name || "Masjid";
  const area = masjid.area?.name || "";
  const city = masjid.city?.name || "";

  const timings = masjid.prayerTimings?.[0] || {};

  const prayers = [
    ["Fajr", timings?.fajr?.iqaamat],
    ["Zohar", timings?.Zohar?.iqaamat],
    ["Asr", timings?.asr?.iqaamat],
    ["Maghrib", timings?.maghrib?.iqaamat],
    ["Isha", timings?.isha?.iqaamat],
    ["Juma", timings?.juma?.iqaamat],
  ].filter(([, t]) => t);

  const imageUrl =
    masjid.imageUrl?.startsWith("http")
      ? masjid.imageUrl
      : `${SITE_URL}/Default_Image.png`;

  /* ---------- Render OG Image ---------- */
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#020617",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            height: "40%",
            width: "100%",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* HEADER */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 700 }}>
              {name}
            </div>
            <div
              style={{
                fontSize: 22,
                marginTop: 6,
                opacity: 0.85,
              }}
            >
              {[area, city].filter(Boolean).join(", ")}
            </div>
          </div>

          {/* PRAYER TIMES */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {prayers.map(([label, time]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.08)",
                  fontSize: 24,
                }}
              >
                <span>{label}</span>
                <strong>{formatTime(time)}</strong>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 20,
              opacity: 0.75,
            }}
          >
            CitySalah.in
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,   // 📱 Story / Status
      height: 1920,
    }
  );
}
