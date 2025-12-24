// src/app/masjid/page.js

import MasjidSearchClientWrapper from "./MasjidSearchClientWrapper";

export const metadata = {
  title: "Masjids Near You | CitySalah",
  description:
    "Search masjids by city and area. View prayer timings, location, and contact details.",
  alternates: {
    canonical: "https://citysalah.in/masjid",
  },
};

export default function MasjidSearchPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-7xl mx-auto">
      {/* SEO HEADER (SERVER RENDERED) */}
      <header className="max-w-3xl mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Find Masjids Near You
        </h1>

        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
          Browse masjids by city and area. Get prayer timings and contact
          details.
        </p>
      </header>

      {/* CLIENT-ONLY SEARCH UI */}
      <MasjidSearchClientWrapper />
    </main>
  );
}
