// src/app/sitemap-static.xml/route.js

import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://citysalah.in";

  const urls = [
    "/",
    "/updates",
    "/login",
    "/register",
    "/auqatus-salah",
    "/contact",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `
  <url>
    <loc>${base}${u}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
