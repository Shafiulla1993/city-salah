// src/app/[citySlug]/[areaSlug]/ramzan-timetable/page.js

import RamzanClient from "./RamzanClient";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;

  const cityName = citySlug.replace(/-/g, " ");
  const areaName = areaSlug.replace(/-/g, " ");

  const title = `Ramzan Sehri & Iftar Timetable in ${areaName}, ${cityName} | CitySalah`;

  const description = `Accurate Ramzan Sehri end time and Iftar (Maghrib) time for ${areaName}, ${cityName}. Daily fasting timetable based on local masjid prayer times.`;

  const keywords = [
    `ramzan timetable ${cityName}`,
    `sehri time ${areaName}`,
    `iftar time today ${cityName}`,
    `ramadan fasting time ${areaName}`,
    `maghrib time iftar ${cityName}`,
    `ramzan calendar ${cityName}`,
    `sehri iftar near me`,
  ];

  const canonical = `https://citysalah.in/${citySlug}/${areaSlug}/ramzan-timetable`;

  return {
    title,
    description,
    keywords,
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

export default async function Page({ params }) {
  const { citySlug, areaSlug } = await params;
  return <RamzanClient citySlug={citySlug} areaSlug={areaSlug} />;
}
