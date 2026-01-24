// src/app/masjid/[slug]/page.js

import { permanentRedirect, notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";

export default async function MasjidResolver({ params }) {
  const { slug } = await params;

  // Legacy lookup: search index
  const rows = await serverFetch("/api/public/masjids?mode=index").catch(
    () => [],
  );

  const masjid = rows.find((m) => m.slug === slug);
  if (!masjid) notFound();

  // 301 redirect to canonical URL
  permanentRedirect(
    `/${masjid.citySlug}/${masjid.areaSlug}/masjid/${masjid.slug}`
  );
}
