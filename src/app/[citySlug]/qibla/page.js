// src/app/[citySlug]/qibla/page.js
import QiblaClient from "@/app/qibla/QiblaClient";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }) {
  const { citySlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");

  const keywords = [
    `qibla direction in ${cityName}`,
    `kaaba direction in ${cityName}`,
    `prayer direction ${cityName}`,
    `qibla compass ${cityName}`,
  ];

  return {
    title: `Qibla Direction in ${cityName} | Kaaba Direction`,
    description: `Find the accurate Qibla direction in ${cityName} using compass-based guidance for daily prayers.`,
    keywords,
    robots: "index, follow",
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/qibla`,
    },
  };
}

export default async function Page({ params }) {
  const { citySlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");

  // ✅ BREADCRUMB JSON-LD (CITY)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "https://citysalah.in" },
    { name: cityName, url: `https://citysalah.in/${citySlug}` },
    {
      name: "Qibla Direction",
      url: `https://citysalah.in/${citySlug}/qibla`,
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
      <QiblaClient cityName={cityName} areaName="Your Area" />
    </>
  );
}
