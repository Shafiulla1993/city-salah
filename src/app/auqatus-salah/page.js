// src/app/auqatus-salah/page.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function AuqatusSalahResolver() {
  const router = useRouter();
  const { init, initializing, citySlug, areaSlug, detectMyLocation, coords } =
    useMasjidStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initializing) return;

    if (citySlug && areaSlug) {
      router.replace(`/${citySlug}/${areaSlug}/auqatus-salah`);
      return;
    }

    detectMyLocation();
  }, [initializing, citySlug, areaSlug, detectMyLocation, router]);

  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return;

    const resolve = async () => {
      const res = await fetch(
        `/api/location/resolve?lat=${coords.lat}&lng=${coords.lng}`,
      );
      const data = await res.json();

      if (data.success && data.type === "area") {
        router.replace(`/${data.citySlug}/${data.areaSlug}/auqatus-salah`);
      } else if (data.success && data.type === "city") {
        router.replace(`/${data.citySlug}/auqatus-salah`);
      } else {
        router.replace("/auqatus-salah/your-location");
      }
    };

    resolve();
  }, [coords, router]);

  return null;
}
