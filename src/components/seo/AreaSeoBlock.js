// src/components/seo/AreaSeoBlock.js

export default function AreaSeoBlock({ area, city, masjidCount }) {
  return (
    <section className="mt-16 max-w-4xl text-sm text-slate-200 leading-relaxed">
      <h2 className="text-lg font-semibold text-white mb-3">
        Masjids in {area.name}, {city.name}
      </h2>

      <p className="mb-3">
        This page lists {masjidCount} masjids located in {area.name},{" "}
        {city.name}. You can view prayer timings, masjid locations, and contact
        details for each masjid listed above.
      </p>

      <p className="mb-3">
        Area-wise masjid listings help residents and travelers easily find a
        nearby masjid for daily prayers, Jummah, and special occasions.
      </p>

      <p>
        CitySalah aims to provide accurate and updated masjid information for
        {area.name} and nearby localities in {city.name}.
      </p>
    </section>
  );
}
