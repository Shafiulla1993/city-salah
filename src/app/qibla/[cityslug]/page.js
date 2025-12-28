// src/app/qibla/[citySlug]/page.js

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
    <main className="min-h-screen flex flex-col items-center pt-6 pb-24">
      {/* ✅ SEO CONTENT FIRST (SSR) */}
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          Qibla Direction in {city.name}
        </h1>

        <p className="text-sm text-gray-600 mb-2">
          Find the approximate Qibla direction in {city.name} using averaged
          area coordinates from {areasCount} localities.
        </p>

        <p className="text-xs text-gray-500">
          Disclaimer: Direction shown is an estimate based on geographic
          calculations. For precise alignment, please verify with a nearby
          mosque or physical compass.
        </p>
      </section>

      {/* 🧭 INTERACTIVE COMPASS */}
      <QiblaClient
        mode="city"
        initialLat={center.lat}
        initialLng={center.lng}
      />
    </main>
  );
}
