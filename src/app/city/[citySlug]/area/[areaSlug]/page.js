// src/app/city/[citySlug]/area/[areaSlug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";


export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params; // ✅ FIX

  const city = citySlug.replace(/-/g, " ");
  const area = areaSlug.replace(/-/g, " ");

  return {
    title: `Masjids in ${area}, ${city} | CitySalah`,
    description: `Find masjids and prayer timings in ${area}, ${city}.`,
    alternates: {
      canonical: `https://citysalah.in/city/${citySlug}/area/${areaSlug}`,
    },
  };
}

export default async function AreaPage({ params }) {
  const { citySlug, areaSlug } = await params; // ✅ FIX

  const areas = await serverFetch("/api/public/allareas");

  const area = areas.find(
    (a) =>
      a.city.toLowerCase().replace(/\s+/g, "-") === citySlug &&
      a.name.toLowerCase().replace(/\s+/g, "-") === areaSlug
  );

  if (!area) notFound();

  const masjids = await serverFetch("/api/public/masjids");
  const filtered = masjids.filter((m) => m.area?.name === area.name);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">
        Masjids in {area.name}, {area.city}
      </h1>

      <p className="mt-4 text-gray-700">
        Find nearby masjids, prayer timings, and Jummah schedules
        in {area.name}, {area.city}.
      </p>

      <ul className="mt-6 space-y-2">
        {filtered.map((m) => (
          <li key={m._id}>
            <Link
              href={`/masjid/${m.slug}-${m._id}`}
              className="text-blue-600 hover:underline"
            >
              {m.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
