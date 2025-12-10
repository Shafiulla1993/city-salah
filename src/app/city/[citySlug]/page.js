// /src/app/city/[citySlug]/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import ClientRedirectToHome from "@/components/ClientRedirectToHome";
import { generateSlug } from "@/lib/helpers/slugHelper";

export async function generateStaticParams() {
  const cities = await serverFetch("/api/public/cities");

  return cities.map((c) => ({
    citySlug: generateSlug(c.name),
  }));
}

export async function generateMetadata({ params }) {
  const citySlug = params.citySlug;
  const cityName = citySlug.replace(/-/g, " ");

  return {
    title: `${cityName} — Masjids & Prayer Timings`,
    description: `Find masjids and prayer timings for ${cityName}.`,
  };
}

export default async function CitySEO({ params }) {
  const citySlug = params.citySlug;

  const allCities = await serverFetch("/api/public/cities");
  const city = allCities.find((c) => generateSlug(c.name) === citySlug);

  if (!city)
    return (
      <main className="p-6">
        <h1>City Not Found</h1>
        <ClientRedirectToHome />
      </main>
    );

  const areas = await serverFetch(`/api/public/areas?cityId=${city._id}`);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Masjids in {city.name}</h1>

      <ul className="mt-4 space-y-2">
        {areas.map((a) => (
          <li key={a._id}>{a.name}</li>
        ))}
      </ul>

      <ClientRedirectToHome />
    </main>
  );
}
