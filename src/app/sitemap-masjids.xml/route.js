// src/app/sitemap-masjids.xml/route.js
import { serverFetch } from "@/lib/http/serverFetch";

export async function GET() {
  const base = "https://citysalah.in";

  const masjids = await serverFetch("/api/public/masjids?mode=index");

  const urls = masjids
    .map(
      (m) => `
  <url>
    <loc>${base}/${m.citySlug}/${m.areaSlug}/masjid/${m.slug}</loc>
    <lastmod>${new Date(m.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
