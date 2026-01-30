// src/app/[citySlug]/[areaSlug]/auqatus-salah/page.js

import AuqatusSalahClient from "./AuqatusSalahClient";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");

  return {
    title: `Auqatus Salah in ${areaName}, ${cityName} | CitySalah`,
    description: `Prayer time windows for ${areaName}, ${cityName}. Fajr, Zohar, Asr, Maghrib and Isha timings.`,
    robots: "index, follow",
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/${areaSlug}/auqatus-salah`,
    },
  };
}

export default async function Page({ params }) {
  const { citySlug, areaSlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");

  // ✅ BREADCRUMB JSON-LD (AREA)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "https://citysalah.in" },
    { name: cityName, url: `https://citysalah.in/${citySlug}` },
    {
      name: areaName,
      url: `https://citysalah.in/${citySlug}/${areaSlug}`,
    },
    {
      name: "Auqatus Salah",
      url: `https://citysalah.in/${citySlug}/${areaSlug}/auqatus-salah`,
    },
  ]);

  return (
    <>
      {/* ✅ Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      {/* ✅ EXISTING FEATURE — untouched */}
      <AuqatusSalahClient citySlug={citySlug} areaSlug={areaSlug} />
    </>
  );
}
