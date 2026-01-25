// src/app/sitemap-qibla-cities.xml/route.js

import { serverFetch } from "@/lib/http/serverFetch";

export async function GET() {
  const base = "https://citysalah.in";
  const now = new Date().toISOString();

  const cities = await serverFetch("/api/public/cities");

  const urls = cities
    .map(
      (c) => `
    <url>
      <loc>${base}/${c.slug}/qibla</loc>
      <lastmod>${now}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
