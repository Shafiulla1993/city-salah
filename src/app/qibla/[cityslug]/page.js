// src/app/qibla/[citySlug]/page.js

import { notFound } from "next/navigation";
import { publicAPI } from "@/lib/api/public";
import QiblaClient from "@/app/qibla/QiblaClient";

/* -----------------------------
   METADATA
------------------------------ */
export async function generateMetadata({ params }) {
  const { cityslug } = await params;

  try {
    const data = await publicAPI.getCityQibla(cityslug);

    return {
      title: `Qibla Direction in ${data.city.name} | CitySalah`,
      description: `Find approximate Qibla direction in ${data.city.name} using area-based coordinates.`,
    };
  } catch {
    return {
      title: "Qibla Direction | CitySalah",
      description: "Find Qibla direction using CitySalah.",
    };
  }
}

/* -----------------------------
   PAGE
------------------------------ */
export default async function CityQiblaPage({ params }) {
  const { cityslug } = await params;

  let data;
  try {
    data = await publicAPI.getCityQibla(cityslug);
  } catch {
    notFound();
  }

  const { city, center, areasCount } = data;

  return (
    <main className="bg-white">
      {/* Compass */}
      <QiblaClient
        mode="city"
        initialLat={center.lat}
        initialLng={center.lng}
      />

      {/* SEO Content */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          Qibla Direction in {city.name}
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          This Qibla direction is calculated using the average coordinates of{" "}
          {areasCount} areas in {city.name}.
        </p>

        <p className="text-xs text-gray-500">
          Disclaimer: This is an approximate direction intended for general
          guidance. For precise alignment, please use the live compass or
          consult a nearby mosque.
        </p>
      </section>
    </main>
  );
}
