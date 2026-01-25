// src/app/[citySlug]/qibla/QiblaCityClient.js
"use client";

import QiblaClient from "@/app/qibla/QiblaClient";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function QiblaCityClient({ city, lat, lng, areasCount }) {
  const { detectMyLocation, coords } = useMasjidStore();

  return (
    <main className="flex flex-col text-slate-100">
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-2 text-center">
        <h1 className="text-xl font-semibold">
          Qibla Direction in {city.name}
        </h1>

        <p className="mt-2 text-sm text-slate-50">
          Calculated using averaged coordinates from {areasCount} areas.
        </p>

        <button
          onClick={detectMyLocation}
          className="mt-3 text-xs underline text-white/80"
        >
          Detect My Location for exact direction
        </button>
      </section>

      <QiblaClient
        mode="city"
        initialLat={coords?.lat || lat}
        initialLng={coords?.lng || lng}
      />
    </main>
  );
}
