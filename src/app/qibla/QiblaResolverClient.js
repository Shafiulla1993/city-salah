// src/app/qibla/QiblaResolverClient.js

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function QiblaResolverClient() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!navigator.geolocation) {
      router.replace("/qibla/your-location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const res = await fetch(
          `/api/public/auqatus/resolve?lat=${lat}&lng=${lng}`,
        );

        if (!res.ok) {
          router.replace("/qibla/your-location");
          return;
        }

        const data = await res.json();

        if (!data.success || !data.citySlug) {
          router.replace("/qibla/your-location");
          return;
        }

        if (data.type === "area") {
          router.replace(`/${data.citySlug}/${data.areaSlug}/qibla`);
        } else {
          // city or geo-city
          router.replace(`/${data.citySlug}/qibla`);
        }
      },
      () => {
        router.replace("/qibla/your-location");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [router]);

  return (
    <section className="py-24 text-center text-white">
      <h2 className="text-lg font-semibold mb-2">Detecting your location…</h2>
      <p className="text-sm opacity-80">
        Finding your city to show Qibla direction.
      </p>
    </section>
  );
}
