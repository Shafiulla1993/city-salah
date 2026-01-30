// src/app/[citySlug]/[areaSlug]/qibla/page.js

import QiblaClient from "@/app/qibla/QiblaClient";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");

  const keywords = [
    `qibla direction in ${areaName}`,
    `kaaba direction ${areaName} ${cityName}`,
    `prayer direction ${areaName}`,
  ];

  return {
    title: `Qibla Direction in ${areaName}, ${cityName} | Kaaba Direction`,
    description: `Find the accurate Qibla direction in ${areaName}, ${cityName} for daily prayers.`,
    keywords,
    robots: "index, follow",
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/${areaSlug}/qibla`,
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
      name: "Qibla Direction",
      url: `https://citysalah.in/${citySlug}/${areaSlug}/qibla`,
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
      <QiblaClient cityName={cityName} areaName={areaName} />
    </>
  );
}
