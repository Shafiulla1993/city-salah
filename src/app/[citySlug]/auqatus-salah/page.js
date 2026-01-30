// src/app/[citySlug]/auqatus-salah/page.js
import AuqatusCityClient from "./AuqatusCityClient";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

export async function generateMetadata({ params }) {
  const { citySlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");

  const keywords = [
    `fajr time in ${cityName}`,
    `sehri time in ${cityName}`,
    `zohar time in ${cityName}`,
    `asr time in ${cityName}`,
    `maghrib time in ${cityName}`,
    `isha time in ${cityName}`,
    `auqatus salah in ${cityName}`,
  ];

  return {
    title: `Auqatus Salah Timings in ${cityName} | CitySalah`,
    description: `Prayer time windows in ${cityName}. Fajr, Zohar, Asr, Maghrib and Isha start times.`,
    keywords,
    robots: "index, follow",
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/auqatus-salah`,
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
      name: "Auqatus Salah",
      url: `https://citysalah.in/${citySlug}/auqatus-salah`,
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
      <AuqatusCityClient citySlug={citySlug} />
    </>
  );
}
