// src/app/masjid/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import MasjidCardLite from "@/components/masjid/MasjidCardLite";
import CityPills from "@/components/location/CityPills";

export const metadata = {
  title: "Search Masjids by City & Area | CitySalah",
  description:
    "Browse masjids by city and area. Find mosque locations, prayer timings, and contact details.",
  alternates: {
    canonical: "https://citysalah.in/masjid",
  },
};

export default async function MasjidSearchPage() {
  const [cities, masjids] = await Promise.all([
    serverFetch("/api/public/cities"),
    serverFetch("/api/public/masjids/index"),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* H1 */}
      <h1 className="text-2xl font-bold mb-3">Search Masjids by City & Area</h1>

      {/* SEO INTRO */}
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        CitySalah helps you discover masjids across different cities and areas.
        Browse mosques by location and view prayer timings, address, and contact
        details.
      </p>

      {/* CITY PILLS */}
      <CityPills cities={cities} />

      {/* MASJID GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {masjids.slice(0, 8).map((masjid) => (
          <MasjidCardLite key={masjid._id} masjid={masjid} />
        ))}
      </div>

      {/* FOOTER SEO TEXT */}
      <p className="mt-10 text-xs text-slate-500 max-w-3xl">
        Looking for a specific masjid? Use city and area pages to narrow your
        search and explore mosque details easily.
      </p>
    </main>
  );
}
