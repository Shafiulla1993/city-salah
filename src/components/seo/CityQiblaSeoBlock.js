// src/components/seo/CityQiblaSeoBlock.js

export default function CityQiblaSeoBlock({ city }) {
  return (
    <section className="mt-16 max-w-4xl text-sm text-slate-200 leading-relaxed">
      <h2 className="text-lg font-semibold text-white mb-3">
        Qibla Direction in {city.name}
      </h2>

      <p className="mb-3">
        This page provides the approximate Qibla direction for
        {city.name}. The direction is calculated based on the geographic
        locations of multiple areas within the city.
      </p>

      <p className="mb-3">
        Since Qibla direction may vary slightly within different parts of a
        city, this value should be used as a general reference.
      </p>

      <p>
        For precise alignment during prayer, it is recommended to use the live
        Qibla compass available on CitySalah.
      </p>
    </section>
  );
}
