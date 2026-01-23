// src/app/[citySlug]/[areaSlug]/auqatus-salah/page.js

import AuqatusSalahClient from "./AuqatusSalahClient";

/* ----------- SEO ----------- */
export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;

  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");

  const title = `Auqatus Salah Timings in ${areaName}, ${cityName} | CitySalah`;
  const description = `Daily Sehri, Fajr, Zohar, Asr, Maghrib and Isha timings for ${areaName}, ${cityName}.`;

  const canonical = `https://citysalah.in/${citySlug}/${areaSlug}/auqatus-salah`;

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
  const { citySlug, areaSlug } = await params;

  return <AuqatusSalahClient citySlug={citySlug} areaSlug={areaSlug} />;
}
