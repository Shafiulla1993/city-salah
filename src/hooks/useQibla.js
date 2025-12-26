// src/hooks/useQibla.js

"use client";

import { useEffect, useState } from "react";
import { getQiblaBearing } from "@/lib/qibla";

export function useQibla({ fallbackLocation } = {}) {
  const [bearing, setBearing] = useState(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState(null);

  /* 📍 LOCATION OR FALLBACK */
  useEffect(() => {
    // 1️⃣ Use fallback city if provided
    if (fallbackLocation?.lat && fallbackLocation?.lng) {
      const q = getQiblaBearing(fallbackLocation.lat, fallbackLocation.lng);
      setBearing(q);
      return;
    }

    // 2️⃣ Otherwise use GPS
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setBearing(getQiblaBearing(latitude, longitude));
      },
      () => setError("Location permission denied"),
      { enableHighAccuracy: true }
    );
  }, [fallbackLocation]);

  /* 🧭 COMPASS */
  useEffect(() => {
    function onOrientation(e) {
      if (typeof e.alpha === "number") {
        setHeading(e.alpha);
      }
    }

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, []);

  return { bearing, heading, error };
}
