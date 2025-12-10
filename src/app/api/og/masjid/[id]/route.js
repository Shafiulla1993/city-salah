// src/app/api/og/masjid/[id]/route.js

import { ImageResponse } from "next/og";
import { publicAPI } from "@/lib/api/public";

export const runtime = "edge";

export async function GET(req, { params }) {
  const id = params.id;

  const masjid = await publicAPI.getMasjidById(id);

  const title = masjid?.name || "Masjid";
  const area = masjid?.area?.name || "";
  const city = masjid?.city?.name || "";

  const fullName = [title, area, city].filter(Boolean).join(", ");

  const imageUrl =
    masjid?.imageUrl && masjid.imageUrl.startsWith("http")
      ? masjid.imageUrl
      : masjid?.imageUrl
      ? `https://citysalah.in/uploads/masjids/${masjid.imageUrl}`
      : "https://citysalah.in/Default_Image.png";

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "40px",
          background: "#f8fafc",
          color: "#0f172a",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: 54,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {title}
        </h1>

        <img
          src={imageUrl}
          width="100%"
          height="380"
          style={{
            objectFit: "contain",
            borderRadius: 12,
            background: "#e2e8f0",
          }}
        />

        <p
          style={{
            fontSize: 32,
            marginTop: 25,
            textAlign: "center",
            color: "#334155",
          }}
        >
          {area ? `${area}, ` : ""}
          {city}
        </p>

        <div
          style={{
            fontSize: 28,
            marginTop: 40,
            textAlign: "center",
            color: "#475569",
          }}
        >
          CitySalah — Live Prayer Timings
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
