// src/app/[citySlug]/[areaSlug]/masjid/[masjidSlug]/page.js

import MasjidClientPage from "./masjidClientPage";

/* ----------- SEO ----------- */
export async function generateMetadata({ params }) {
  const { citySlug, areaSlug, masjidSlug } = await params;

  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");
  const masjidName = masjidSlug.replace(/-/g, " ");

  const title = `${masjidName}, ${areaName}, ${cityName} | CitySalah`;
  const description = `Prayer timings and details for ${masjidName} in ${areaName}, ${cityName}.`;

  const canonical = `https://citysalah.in/${citySlug}/${areaSlug}/masjid/${masjidSlug}`;

  return {
    title,
    description,
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

  return (
    <MasjidClientPage
      citySlug={citySlug}
      areaSlug={areaSlug}
      masjidSlug={masjidSlug}
    />
  );
}
