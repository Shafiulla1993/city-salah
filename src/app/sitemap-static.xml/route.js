// src/app/sitemap-static.xml/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://citysalah.in";
  const now = new Date().toISOString();

  const urls = [
    "/", // Home
    "/masjid", // Masjid search page
    "/nearest-masjid",
    "/auqatus-salah",
    "/updates",
    "/contact",
    "/qibla",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `
  <url>
    <loc>${base}${u}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
