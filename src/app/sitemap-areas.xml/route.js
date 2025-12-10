// src/app/sitemap-areas.xml/route.js

import { serverFetch } from "@/lib/http/serverFetch";
import { generateSlug } from "@/lib/helpers/slugHelper";

export async function GET() {
  const base = "https://citysalah.in";

  const areas = await serverFetch("/api/public/allareas");

  const urls = areas
    .map(
      (a) => `
    <url>
      <loc>${base}/city/${generateSlug(a.city)}/area/${generateSlug(
        a.name
      )}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
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
