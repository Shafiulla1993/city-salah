// src/app/auqatus-salah/AuqatusResolverClient.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuqatusResolverClient() {
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

        const res = await fetch(
          `/api/public/auqatus/resolve?lat=${lat}&lng=${lng}`,
        );
        const data = await res.json();

        if (data.success && data.citySlug) {
          if (data.type === "area") {
            router.replace(`/${data.citySlug}/${data.areaSlug}/auqatus-salah`);
          } else {
            router.replace(`/${data.citySlug}/auqatus-salah`);
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
