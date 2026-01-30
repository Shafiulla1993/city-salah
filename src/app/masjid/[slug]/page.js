// src/app/masjid/[slug]/page.js

import { permanentRedirect, notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";

export default async function MasjidResolver({ params }) {
  const { slug } = await params;

  // handle legacy slug-id format
  const cleanSlug = slug.includes("-")
    ? slug.split("-").slice(0, -1).join("-")
    : slug;

  const rows = await serverFetch("/api/public/masjids?mode=index").catch(
    () => [],
  );

  const masjid = rows.find((m) => m.slug === cleanSlug);
  if (!masjid) notFound();

  permanentRedirect(
    `/${masjid.citySlug}/${masjid.areaSlug}/masjid/${masjid.slug}`,
  );
}
