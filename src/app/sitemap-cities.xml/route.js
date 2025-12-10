// src/app/sitemap-cities.xml/route.js

import { serverFetch } from "@/lib/http/serverFetch";
import { generateSlug } from "@/lib/helpers/slugHelper";

export async function GET() {
  const base = "https://citysalah.in";

  const cities = await serverFetch("/api/public/cities");

  const urls = cities
    .map(
      (c) => `
    <url>
      <loc>${base}/city/${generateSlug(c.name)}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
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
