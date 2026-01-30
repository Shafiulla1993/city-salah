// src/app/ramzan-timetable/RamzanResolverClient.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RamzanResolverClient() {
  const router = useRouter();

  useEffect(() => {
    if (!navigator.geolocation) {
      router.replace("/auqatus-salah/your-location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // reuse EXACT SAME resolver as Auqatus
        const res = await fetch(
          `/api/public/auqatus/resolve?lat=${lat}&lng=${lng}`,
        );
        const data = await res.json();

        if (data.success && data.citySlug) {
          if (data.type === "area") {
            router.replace(
              `/${data.citySlug}/${data.areaSlug}/ramzan-timetable`,
            );
          } else {
            router.replace(`/${data.citySlug}/ramzan-timetable`);
          }
        }
      },
      () => {
        router.replace("/auqatus-salah/your-location");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [router]);

  return null;
}
