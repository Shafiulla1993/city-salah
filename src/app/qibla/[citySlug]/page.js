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
  const { citySlug } = await params;

  const data = await serverFetch(`/api/public/qibla/city/${citySlug}`);

  return (
    <main className="flex flex-col text-slate-100 ">
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-2 text-center">
        <h1 className="text-xl font-semibold">
          Qibla Direction in {data.city.name}
        </h1>

        <p className="mt-2 text-sm text-slate-50">
          The Qibla direction below is calculated using averaged geographic
          coordinates from {data.areasCount} areas in {data.city.name}.
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
