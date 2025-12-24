// src/components/location/CityPills.js

import Link from "next/link";

export default function CityPills({ cities = [] }) {
  if (!cities.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">
        Browse by City
      </h2>

      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <Link
            key={city._id}
            href={`/city/${city.slug}`}
            className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
          >
            {city.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
