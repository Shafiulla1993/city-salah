// src/app/[citySlug]/auqatus-salah/page.js

import AuqatusCityClient from "./AuqatusCityClient";

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
    `today prayer time in ${cityName}`,
    `today sehri time in ${cityName}`,
    `today iftar time in ${cityName}`,
    `auqatus salah in ${cityName}`,
  ];

  return {
    title: `Auqatus Salah Timings in ${cityName} | CitySalah`,
    description: `Today's Sehri, Fajr, Zohar, Asr, Maghrib and Isha timings for ${cityName}.`,
    keywords,
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/auqatus-salah`,
    },
  };
}

export default async function Page({ params }) {
  const { citySlug } = await params;
  return <AuqatusCityClient citySlug={citySlug} />;
}
