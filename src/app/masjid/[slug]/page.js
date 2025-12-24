// src/app/masjid/[slug]/page.js

import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/http/serverFetch";
import MasjidDetailsLayout from "@/components/masjid/MasjidDetailsLayout";

import { normalizePrayerTimings } from "@/lib/helpers/normalizePrayerTimings";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";

/* --------------------------------
   SEO METADATA
--------------------------------- */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!slug) return {};

  const masjid = await serverFetch(`/api/public/masjids/${slug}`).catch(
    () => null
  );

  if (!masjid) return {};

  const city = masjid.city?.name || "";
  const area = masjid.area?.name || "";

  return {
    title: `${masjid.name}, ${area}, ${city} – Prayer Timings | CitySalah`,
    description: `View prayer timings, address, and contact details for ${masjid.name} in ${area}, ${city}.`,
    alternates: {
      canonical: `https://citysalah.in/masjid/${slug}`,
    },
  };
}

/* --------------------------------
   PAGE
--------------------------------- */
export default async function MasjidPage({ params }) {
  const { slug } = await params;

  if (!slug) notFound();

  /* -----------------------------
     1️⃣ Fetch FULL masjid
  ------------------------------ */
  const masjid = await serverFetch(`/api/public/masjids/${slug}`).catch(
    () => null
  );

  if (!masjid) notFound();

  const today = new Date().toISOString().slice(0, 10);

  /* -----------------------------
     2️⃣ Fetch timings in parallel
  ------------------------------ */
  const [rawMasjidTimings, rawGeneralTimings] = await Promise.all([
    serverFetch(`/api/public/timings?masjidId=${masjid._id}`).catch(() => null),
    serverFetch(
      `/api/public/general-timings?cityId=${masjid.city?._id}&areaId=${masjid.area?._id}&date=${today}`
    ).catch(() => null),
  ]);

  /* -----------------------------
     3️⃣ Normalize ONCE
  ------------------------------ */
  const masjidTimings = rawMasjidTimings?.data
    ? normalizePrayerTimings(rawMasjidTimings.data)
    : null;

  const generalTimings = rawGeneralTimings?.data
    ? normalizeGeneralTimings(rawGeneralTimings.data)
    : [];

  /* -----------------------------
     4️⃣ Render SEO-FIRST layout
  ------------------------------ */
  return (
    <MasjidDetailsLayout
      masjid={masjid}
      masjidTimings={masjidTimings}
      generalTimings={generalTimings}
    />
  );
}
