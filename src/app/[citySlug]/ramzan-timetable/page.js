// src/app/[citySlug]/ramzan-timetable/page.js

import RamzanCityClient from "./RamzanCityClient";

export async function generateMetadata({ params }) {
  const { citySlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");

  return {
    title: `Ramzan Sehri & Iftar Timetable in ${cityName} | CitySalah`,
    description: `Today's Sehri and Iftar timings for ${cityName}.`,
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/ramzan-timetable`,
    },
  };
}

export default async function Page({ params }) {
  const { citySlug } = await params;
  return <RamzanCityClient citySlug={citySlug} />;
}
