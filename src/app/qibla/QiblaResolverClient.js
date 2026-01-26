// src/app/qibla/QiblaResolverClient.js

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function QiblaResolverClient() {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const res = await fetch(
          `/api/public/areas/nearest?lat=${lat}&lng=${lng}`,
        );

        if (!res.ok) return;

        const data = await res.json();
        router.replace(`/${data.city.slug}/${data.area.slug}/qibla`);
      },
      () => {
        // Permission denied or error
      },
      { enableHighAccuracy: true },
    );
  }, [router]);

  return (
    <section className="py-24 text-center text-white">
      <h2 className="text-lg font-semibold mb-2">Detecting your location…</h2>
      <p className="text-sm opacity-80">
        Finding your area to show accurate Qibla direction.
      </p>
    </section>
  );
}
