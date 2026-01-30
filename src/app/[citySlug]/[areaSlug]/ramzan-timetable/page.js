// src/app/[citySlug]/[areaSlug]/ramzan-timetable/page.js

import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";
import RamzanClient from "./RamzanClient";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");

  const keywords = [
    `ramzan timetable ${areaName}`,
    `sehri time in ${areaName}`,
    `iftar time in ${areaName}`,
    `ramadan fasting time ${areaName} ${cityName}`,
  ];

  return {
    title: `Ramzan Sehri & Iftar Timetable in ${areaName}, ${cityName} | CitySalah`,
    description: `Ramzan Sehri and Iftar timings for ${areaName}, ${cityName}. Daily fasting timetable.`,
    keywords,
    robots: "index, follow",
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/${areaSlug}/ramzan-timetable`,
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
      name: "Ramzan Timetable",
      url: `https://citysalah.in/${citySlug}/${areaSlug}/ramzan-timetable`,
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
      <RamzanClient citySlug={citySlug} areaSlug={areaSlug} />
    </>
  );
}
