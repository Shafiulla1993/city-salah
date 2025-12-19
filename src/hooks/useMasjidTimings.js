// src/hooks/useMasjidTimings.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export function useMasjidTimings(masjidId) {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!masjidId) return;

    let mounted = true;
    setLoading(true);

    publicAPI
      .getPrayerTimings(masjidId)
      .then((res) => {
        if (mounted) setTimings(res || {});
      })
      .catch(() => {
        if (mounted) setTimings(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [masjidId]);

  return { timings, loading };
}
