// src/app/sitemap-cities.xml/route.js
import { serverFetch } from "@/lib/http/serverFetch";

export async function GET() {
  const base = "https://citysalah.in";
  const now = new Date().toISOString();

  const cities = await serverFetch("/api/public/cities");

  const urls = cities
    .map(
      (c) => `
  <url>
    <loc>${base}/${c.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${base}/${c.slug}/auqatus-salah</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${base}/${c.slug}/ramzan-timetable</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
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
