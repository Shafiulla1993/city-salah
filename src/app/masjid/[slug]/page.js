// src/app/masjid/[slug]/page.js

import { permanentRedirect } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";

export default async function MasjidResolver({ params }) {
  const { slug } = await params;

  const masjid = await serverFetch(`/api/public/masjids/${slug}`).catch(
    () => null,
  );
  if (!masjid) permanentRedirect("/404");

  permanentRedirect(
    `/${masjid.city.slug}/${masjid.area.slug}/masjid/${masjid.slug}`,
  );
}
