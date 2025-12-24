// src/app/masjid/[slug]/page.js

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { serverFetch } from "@/lib/http/serverFetch";
import MasjidDetailsLayout from "@/components/masjid/MasjidDetailsLayout";
import { MasjidDetailsLayoutSkeleton } from "@/components/masjid/loaders";

import { normalizePrayerTimings } from "@/lib/helpers/normalizePrayerTimings";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

/* --------------------------------
   SEO METADATA
--------------------------------- */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const masjid = await serverFetch(`/api/public/masjids/${slug}`).catch(
    () => null
  );

  if (!masjid) return {};

  return {
    title: `${masjid.name}, ${masjid.area?.name}, ${masjid.city?.name} | CitySalah`,
    description: `Prayer timings and details for ${masjid.name}.`,
    alternates: {
      canonical: `https://citysalah.in/masjid/${masjid.slug}-${masjid._id}`,
    },
  };
}

/* --------------------------------
   PAGE
--------------------------------- */
export default async function MasjidPage(props) {
  const { slug } = await props.params; // ✅ REQUIRED in Next 16

  const masjid = await serverFetch(`/api/public/masjids/${slug}`).catch(
    () => null
  );

  if (!masjid) notFound();

  const today = new Date().toISOString().slice(0, 10);

  const [rawMasjidTimings, rawGeneralTimings] = await Promise.all([
    serverFetch(`/api/public/timings?masjidId=${masjid._id}`).catch(() => null),
    serverFetch(
      `/api/public/general-timings?cityId=${masjid.city?._id}&areaId=${masjid.area?._id}&date=${today}`
    ).catch(() => null),
  ]);

  const masjidTimings = rawMasjidTimings?.data
    ? normalizePrayerTimings(rawMasjidTimings.data)
    : null;

  const generalTimings = rawGeneralTimings?.data
    ? normalizeGeneralTimings(rawGeneralTimings.data)
    : [];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "https://citysalah.in" },
    {
      name: masjid.city.name,
      url: `https://citysalah.in/city/${masjid.city.slug}`,
    },
    {
      name: masjid.area.name,
      url: `https://citysalah.in/city/${masjid.city.slug}/area/${masjid.area.slug}`,
    },
    {
      name: masjid.name,
      url: `https://citysalah.in/masjid/${slug}`,
    },
  ]);

  return (
    <>
      {/* BREADCRUMB SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <Suspense fallback={<MasjidDetailsLayoutSkeleton />}>
        <MasjidDetailsLayout
          masjid={masjid}
          masjidTimings={masjidTimings}
          generalTimings={generalTimings}
        />
      </Suspense>
    </>
  );
}
