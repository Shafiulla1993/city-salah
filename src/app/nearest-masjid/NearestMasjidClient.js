// src/app/nearest-masjid/NearestMasjidClient.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function NearestMasjidClient() {
  const router = useRouter();

  const {
    detectMyLocation,
    citySlug,
    areaSlug,
    masjidSlug,
    loadingLocation,
    resolved,
  } = useMasjidStore();

  // Trigger GPS on load
  useEffect(() => {
    detectMyLocation();
  }, []);

  // Redirect when resolved
  useEffect(() => {
    if (resolved && citySlug && areaSlug && masjidSlug) {
      router.replace(`/${citySlug}/${areaSlug}/masjid/${masjidSlug}`);
    }
  }, [resolved, citySlug, areaSlug, masjidSlug]);

  return (
    <section className="px-4 py-24 text-center text-white max-w-md mx-auto">
      {loadingLocation && (
        <>
          <h2 className="text-lg font-semibold mb-2">
            Detecting your location…
          </h2>
          <p className="text-sm opacity-80">
            Please allow location access to find the nearest masjid.
          </p>
        </>
      )}

      {!loadingLocation && !resolved && (
        <>
          <h2 className="text-lg font-semibold mb-2">
            Location access is required
          </h2>
          <p className="text-sm opacity-80 mb-4">
            Enable GPS to automatically find the nearest masjid near you.
          </p>

          <button
            onClick={detectMyLocation}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold mb-3"
          >
            Allow Location & Find Nearest Masjid
          </button>

          <div className="text-sm opacity-90">
            Or{" "}
            <a href="/masjid" className="underline font-medium">
              search masjid by city and area
            </a>
          </div>
        </>
      )}
    </section>
  );
}
