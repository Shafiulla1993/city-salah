// src/hooks/useGeolocation.js
"use client";

import { useEffect, useState } from "react";

export function useGeolocation({ enableHighAccuracy = true } = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("not-supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => setError("denied"),
      { enableHighAccuracy, timeout: 10000 },
    );
  }, [enableHighAccuracy]);

  return { location, error };
}
