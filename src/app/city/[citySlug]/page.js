// src/app/city/[citySlug]/page.js

import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";
import MasjidCardLite from "@/components/masjid/MasjidCardLite";
import CitySeoBlock from "@/components/seo/CitySeoBlock";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

/* --------------------------------
   SEO METADATA
--------------------------------- */
export async function generateMetadata({ params }) {
  const { citySlug } = await params;
  const cityName = citySlug.replace(/-/g, " ");

  return {
    title: `Masjids in ${cityName} | CitySalah`,
    description: `Find masjids in ${cityName}. Browse mosques by area and view prayer details.`,
    alternates: {
      canonical: `https://citysalah.in/city/${citySlug}`,
    },
  };
}

/* --------------------------------
   PAGE
--------------------------------- */
export default async function CityPage({ params }) {
  const { citySlug } = await params;

  const cities = await serverFetch("/api/public/cities");
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const areas = await serverFetch(`/api/public/areas?cityId=${city._id}`);
  const masjids = await serverFetch(
    `/api/public/masjids/index?city=${city._id}`
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "https://citysalah.in" },
    { name: city.name, url: `https://citysalah.in/city/${city.slug}` },
  ]);

  return (
    <>
      {/* BREADCRUMB SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <main className="px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold mb-2">Masjids in {city.name}</h1>

        <p className="text-sm text-slate-600 mb-6">
          Browse masjids located across different areas of {city.name}.
        </p>

        {/* AREA LINKS */}
        {areas?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {areas.map((area) => (
              <a
                key={area._id}
                href={`/city/${city.slug}/area/${area.slug}`}
                className="text-xs px-3 py-1 rounded-full bg-slate-100 border"
              >
                {area.name}
              </a>
            ))}
          </div>
        )}

        {/* MASJID LIST */}
        {masjids.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {masjids.map((m) => (
              <MasjidCardLite key={m._id} masjid={m} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-slate-500">
            No masjids found in {city.name}.
          </p>
        )}

        {/* SEO TEXT */}
        <CitySeoBlock
          city={city}
          areasCount={areas.length}
          masjidCount={masjids.length}
        />
      </main>
    </>
  );
}
