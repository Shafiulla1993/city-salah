// src/app/[citySlug]/[areaSlug]/qibla/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import QiblaClient from "@/app/qibla/QiblaClient";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;

  const data = await serverFetch(
    `/api/public/areas/by-slug?citySlug=${citySlug}&areaSlug=${areaSlug}`,
  );

  const city = data.city.name;
  const area = data.area.name;

  return {
    title: `Qibla Direction in ${area}, ${city} | Kaaba Direction & Prayer Compass`,
    description: `Find the accurate Qibla direction in ${area}, ${city}. This page also answers: Where is Qibla from ${city}? Which way to face for Salah in ${city}. Use our GPS and compass to know the Kaaba direction from your exact location.`,
    keywords: [
      `Qibla direction in ${area}`,
      `Qibla direction in ${city}`,
      `Where is Qibla from ${city}`,
      `Kaaba direction from ${city}`,
      `Prayer direction in ${city}`,
      `Which way is Qibla in ${city}`,
      `Qibla compass ${city}`,
      `Direction of Makkah from ${city}`,
      `Qibla near me`,
      `Islamic prayer direction ${city}`,
    ].join(", "),
    alternates: {
      canonical: `https://citysalah.in/${citySlug}/${areaSlug}/qibla`,
    },
    openGraph: {
      title: `Qibla Direction in ${area}, ${city}`,
      description: `Accurate Qibla (Kaaba) direction from ${area}, ${city}. Learn which direction to face for prayer in ${city}.`,
      url: `https://citysalah.in/${citySlug}/${areaSlug}/qibla`,
      type: "website",
    },
  };
}

export default async function Page({ params }) {
  const { citySlug, areaSlug } = await params;

  const data = await serverFetch(
    `/api/public/areas/by-slug?citySlug=${citySlug}&areaSlug=${areaSlug}`,
  );

  return <QiblaClient cityName={data.city.name} areaName={data.area.name} />;
}
