// src/app/city/[citySlug]/area/[areaSlug]/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import ClientRedirectToHome from "@/components/ClientRedirectToHome";
import { generateSlug } from "@/lib/helpers/slugHelper";

export async function generateStaticParams() {
  const areas = await serverFetch("/api/public/allareas");

  return areas.map((a) => ({
    citySlug: generateSlug(a.city),
    areaSlug: generateSlug(a.name),
  }));
}

export async function generateMetadata({ params }) {
  const cityName = params.citySlug.replace(/-/g, " ");
  const areaName = params.areaSlug.replace(/-/g, " ");

  return {
    title: `${areaName}, ${cityName} — Masjids & Prayer Timings`,
    description: `Find masjids and prayer timings in ${areaName}, ${cityName}.`,
  };
}

export default async function AreaSEO({ params }) {
  const { citySlug, areaSlug } = params;

  const allAreas = await serverFetch("/api/public/allareas");

  const thisArea = allAreas.find(
    (a) =>
      generateSlug(a.city) === citySlug && generateSlug(a.name) === areaSlug
  );

  if (!thisArea)
    return (
      <main className="p-6">
        <h1>Area Not Found</h1>
        <ClientRedirectToHome />
      </main>
    );

  const masjids = await serverFetch("/api/public/masjids");
  const filtered = masjids.filter(
    (m) => m.area?.name === thisArea.name || m.area === thisArea._id
  );

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">
        Masjids in {thisArea.name}, {thisArea.city}
      </h1>

      <ul className="mt-4 space-y-2">
        {filtered.map((m) => (
          <li key={m._id}>{m.name}</li>
        ))}
      </ul>

      <ClientRedirectToHome />
    </main>
  );
}
