// src/app/city/[citySlug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";


export async function generateMetadata({ params }) {
  // ✅ IMPORTANT: unwrap params
  const { citySlug } = await params;

  const cityName = citySlug.replace(/-/g, " ");

  return {
    title: `${cityName} Masjids & Prayer Timings | CitySalah`,
    description: `Find masjids and prayer timings in ${cityName}.`,
    alternates: {
      canonical: `https://citysalah.in/city/${citySlug}`,
    },
  };
}

export default async function CityPage({ params }) {
  // ✅ IMPORTANT: unwrap params
  const { citySlug } = await params;

  const cities = await serverFetch("/api/public/cities");
  const city = cities.find((c) => c.slug === citySlug);

  if (!city) notFound();

  const areas = await serverFetch(`/api/public/areas?cityId=${city._id}`);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">
        Masjids in {city.name}
      </h1>

      <p className="mt-4 text-gray-700">
        Find nearby masjids, prayer timings, and Jummah schedules in {city.name}.
      </p>

      <ul className="mt-6 space-y-2 list-disc list-inside">
        {areas.map((a) => (
          <li key={a._id}>
            <Link
              href={`/city/${city.slug}/area/${a.name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="text-blue-600 hover:underline"
            >
              Masjids in {a.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
