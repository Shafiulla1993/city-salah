// src/app/qibla/[citySlug]/page.js

import { notFound } from "next/navigation";
import QiblaClient from "@/app/qibla/QiblaClient";
import { serverFetch } from "@/lib/http/serverFetch";

export async function generateMetadata({ params }) {
  const { citySlug } = await params; // ✅ await

  try {
    const data = await serverFetch(`/api/public/qibla/city/${citySlug}`);

    return {
      title: `Qibla Direction in ${data.city.name} | CitySalah`,
      description: `Find Qibla direction in ${data.city.name} using area-based coordinates.`,
    };
  } catch {
    return {
      title: "Qibla Direction | CitySalah",
    };
  }
}

export default async function CityQiblaPage({ params }) {
  const { citySlug } = await params; // ✅ await

  let data;
  try {
    data = await serverFetch(`/api/public/qibla/city/${citySlug}`);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* SEO CONTENT */}
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold">
          Qibla Direction in {data.city.name}
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          This page shows the approximate Qibla direction for {data.city.name}
          based on averaged coordinates from {data.areasCount} local areas.
        </p>
      </section>

      <QiblaClient
        mode="city"
        initialLat={data.center.lat}
        initialLng={data.center.lng}
      />
    </main>
  );
}
