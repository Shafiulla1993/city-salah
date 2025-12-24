// src/components/seo/CitySeoBlock.js

export default function CitySeoBlock({ city, areasCount, masjidCount }) {
  return (
    <section className="mt-16 max-w-4xl text-sm text-slate-200 leading-relaxed">
      <h2 className="text-lg font-semibold text-white mb-3">
        Masjids in {city.name}
      </h2>

      <p className="mb-3">
        CitySalah helps you find verified masjids in {city.name} with accurate
        prayer timings, addresses, and contact information. This page lists
        {masjidCount} masjids across {areasCount} areas of {city.name}.
      </p>

      <p className="mb-3">
        Each masjid page includes daily prayer timings, Jummah details, ladies
        prayer availability, and contact persons such as Imam or Mozin where
        available.
      </p>

      <p>
        Use this page to browse masjids by area or search for a specific masjid
        in {city.name}. CitySalah is continuously updated to ensure accuracy.
      </p>
    </section>
  );
}
