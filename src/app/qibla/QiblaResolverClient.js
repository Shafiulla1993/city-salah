// src/app/qibla/QiblaResolverClient.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function QiblaResolverClient() {
  const router = useRouter();
  const { detectMyCoordsOnly, coords, loadingLocation } = useMasjidStore();

  // Trigger GPS on load (like nearest-masjid)
  useEffect(() => {
    detectMyCoordsOnly();
  }, []);

  // When coords are available, resolve nearest AREA
  useEffect(() => {
    if (!coords) return;

    const resolveArea = async () => {
      const res = await fetch(
        `/api/public/areas/nearest?lat=${coords.lat}&lng=${coords.lng}`,
      );

      if (!res.ok) return;

      const data = await res.json();

      router.replace(`/${data.city.slug}/${data.area.slug}/qibla`);
    };

    resolveArea();
  }, [coords]);

  return (
    <section className="px-4 py-24 text-center text-white max-w-md mx-auto">
      {loadingLocation ? (
        <>
          <h2 className="text-lg font-semibold mb-2">
            Detecting your location…
          </h2>
          <p className="text-sm opacity-80">
            Finding your area to show accurate Qibla direction.
          </p>
        </>
      ) : (
        <p className="text-sm opacity-80">Resolving your area…</p>
      )}
    </section>
  );
}
