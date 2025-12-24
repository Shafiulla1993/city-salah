// src/app/city/[citySlug]/area/[areaSlug]/page.js

import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";
import MasjidCardLite from "@/components/masjid/MasjidCardLite";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;

  return {
    title: `Masjids in ${areaSlug.replace(/-/g, " ")}, ${citySlug.replace(
      /-/g,
      " "
    )} | CitySalah`,
    description: `Find masjids in ${areaSlug.replace(
      /-/g,
      " "
    )}, ${citySlug.replace(/-/g, " ")}.`,
    alternates: {
      canonical: `https://citysalah.in/city/${citySlug}/area/${areaSlug}`,
    },
  };
}

export default async function AreaPage({ params }) {
  const { citySlug, areaSlug } = await params;

  /* 1️⃣ Resolve City */
  const cities = await serverFetch("/api/public/cities");
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  /* 2️⃣ Resolve Area */
  const areas = await serverFetch(`/api/public/areas?cityId=${city._id}`);
  const area = areas.find((a) => a.slug === areaSlug);
  if (!area) notFound();

  /* 3️⃣ Masjids */
  const masjids = await serverFetch(
    `/api/public/masjids/index?city=${city._id}`
  );

  const areaMasjids = masjids.filter(
    (m) => String(m.areaId) === String(area._id)
  );

  return (
    <main className="px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">
        Masjids in {area.name}, {city.name}
      </h1>

      {areaMasjids.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {areaMasjids.map((m) => (
            <MasjidCardLite key={m._id} masjid={m} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-slate-500">
          No masjids found in this area yet.
        </p>
      )}
    </main>
  );
}
