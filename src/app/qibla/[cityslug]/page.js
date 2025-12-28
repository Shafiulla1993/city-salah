// src/app/qibla/[citySlug]/page.js

import connectDB from "@/lib/db";
import City from "@/models/City";
import Area from "@/models/Area";
import { notFound } from "next/navigation";
import QiblaClient from "@/app/qibla/QiblaClient";

/* -----------------------------
   METADATA
------------------------------ */
export async function generateMetadata({ params }) {
  const { cityslug } = await params;

  await connectDB();

  const city = await City.findOne({
    slug: new RegExp(`^${cityslug}$`, "i"),
  }).select("name");

  if (!city) {
    return {
      title: "Qibla Direction | CitySalah",
      description: "Find Qibla direction using CitySalah.",
    };
  }

  return {
    title: `Qibla Direction in ${city.name} | CitySalah`,
    description: `Find approximate Qibla direction in ${city.name} using area-based coordinates.`,
  };
}

/* -----------------------------
   PAGE
------------------------------ */
export default async function CityQiblaPage({ params }) {
  const { cityslug } = await params;

  await connectDB();

  const city = await City.findOne({
    slug: new RegExp(`^${cityslug}$`, "i"),
  }).select("_id name");

  if (!city) notFound();

  const areas = await Area.find({
    city: city._id,
    "center.coordinates.0": { $exists: true },
  })
    .select("center")
    .lean();

  if (!areas.length) notFound();

  // GeoJSON average
  const avgLat =
    areas.reduce((s, a) => s + a.center.coordinates[1], 0) / areas.length;

  const avgLng =
    areas.reduce((s, a) => s + a.center.coordinates[0], 0) / areas.length;

  return (
    <main className="min-h-screen flex flex-col items-center pt-6 pb-24">
      {/* Compass */}
      <QiblaClient mode="city" initialLat={avgLat} initialLng={avgLng} />

      {/* SEO Content */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          Qibla Direction in {city.name}
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          This Qibla direction is calculated using the average coordinates of
          all areas in {city.name}.
        </p>

        <p className="text-xs text-gray-500">
          Disclaimer: This is an approximate direction for city-level guidance.
          For precise alignment, use the live Qibla compass or consult a nearby
          mosque.
        </p>
      </section>
    </main>
  );
}
