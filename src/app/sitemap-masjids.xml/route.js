// src/app/sitemap-masjids.xml/route.js

import { serverFetch } from "@/lib/http/serverFetch";

export async function GET() {
  const base = "https://citysalah.in";
  const now = new Date().toISOString();

  const masjids = await serverFetch("/api/public/masjids");

  const urls = masjids
    .map(
      (m) => `
    <url>
      <loc>${base}/masjid/${m.slug}-${m._id}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  `
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       ${urls}
     </urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}
