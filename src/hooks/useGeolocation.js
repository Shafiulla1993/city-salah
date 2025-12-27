// src/hooks/useGeolocation.js

"use client";

import { useEffect, useState } from "react";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("permission-denied");
        } else {
          setError("gps-off");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  }, []);

  return { location, error, loading };
}
