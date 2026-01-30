// src/app/[citySlug]/[areaSlug]/masjid/[masjidSlug]/page.js

import MasjidClientPage from "./masjidClientPage";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

/* ----------- SEO ----------- */
export async function generateMetadata({ params }) {
  const { citySlug, areaSlug, masjidSlug } = await params;

  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");
  const masjidName = masjidSlug.replace(/-/g, " ");

  const title = `${masjidName} Masjid in ${areaName}, ${cityName} | CitySalah`;
  const description = `Prayer timings and details for ${masjidName} Masjid in ${areaName}, ${cityName}.`;

  const canonical = `https://citysalah.in/${citySlug}/${areaSlug}/masjid/${masjidSlug}`;

  return {
    title,
    description,
    robots: "index, follow",
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "CitySalah",
      type: "website",
    },
  };
}

/* ----------- PAGE ----------- */
export default async function Page({ params }) {
  const { citySlug, areaSlug, masjidSlug } = await params;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "https://citysalah.in" },
    {
      name: citySlug.replace(/-/g, " "),
      url: `https://citysalah.in/${citySlug}`,
    },
    {
      name: areaSlug.replace(/-/g, " "),
      url: `https://citysalah.in/${citySlug}/${areaSlug}`,
    },
    {
      name: masjidSlug.replace(/-/g, " "),
      url: `https://citysalah.in/${citySlug}/${areaSlug}/masjid/${masjidSlug}`,
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

      <MasjidClientPage
        citySlug={citySlug}
        areaSlug={areaSlug}
        masjidSlug={masjidSlug}
      />
    </>
  );
}
