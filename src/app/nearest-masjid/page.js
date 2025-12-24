// src/app/nearest-masjid/page.js

export const metadata = {
  title: "Nearest Masjid Near You | CitySalah",
  description:
    "Find the nearest masjid near you with accurate prayer timings. Allow location access to see masjids closest to you.",
  alternates: {
    canonical: "https://citysalah.in/nearest-masjid",
  },
};

import NearestMasjidClient from "./NearestMasjidClient";

export default function NearestMasjidPage() {
  return (
    <main
      className="min-h-screen bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('/hero-bg.webp')" }}
    >
      <div className="min-h-screen bg-black/30 px-4 py-10">
        {/* SEO CONTENT (VISIBLE TO GOOGLE) */}
        <section className="max-w-3xl mx-auto text-white text-center mb-10">
          <h1 className="text-2xl font-bold mb-3">
            Find the Nearest Masjid Near You
          </h1>

          <p className="text-sm opacity-90 leading-relaxed">
            CitySalah helps you locate nearby masjids and view accurate prayer
            timings. Enable your location to find the closest masjid instantly,
            or search masjids manually by city and area.
          </p>
        </section>

        {/* GPS ENHANCED CONTENT */}
        <NearestMasjidClient />
      </div>
    </main>
  );
}
