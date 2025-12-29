// src/app/qibla/[citySlug]/page.js

import { notFound } from "next/navigation";

import QiblaClient from "@/app/qibla/QiblaClient";
import { serverFetch } from "@/lib/http/serverFetch";

export async function generateMetadata({ params }) {
  const { citySlug } = await params; // REQUIRED in your setup

  try {
    const data = await serverFetch(`/api/public/qibla/city/${citySlug}`);

    return {
      title: `Qibla Direction in ${data.city.name} | CitySalah`,
      description: `Find the approximate Qibla direction in ${data.city.name} using area-based geographic coordinates.`,
    };
  } catch {
    return {
      title: "Qibla Direction | CitySalah",
    };
  }
}

export default async function CityQiblaPage({ params }) {
  const { citySlug } = await params; // REQUIRED

  let data;
  try {
    data = await serverFetch(`/api/public/qibla/city/${citySlug}`);
  } catch (err) {
    console.error("QIBLA FETCH FAILED:", err);
    notFound();
  }

  return (
    <main className="flex flex-col">
      {/* SEO CONTENT */}
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-2 text-center">
        <h1 className="text-xl font-semibold text-white">
          Qibla Direction in {data.city.name}
        </h1>

        <p className="mt-2 text-sm text-white/80">
          The Qibla direction shown below is calculated using averaged
          geographic coordinates from {data.areasCount} local areas in{" "}
          {data.city.name}.
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
