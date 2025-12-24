// src/hooks/useMasjidFeed.js

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export function useMasjidFeed({ limit = 10, cityId, areaId } = {}) {
  const [masjids, setMasjids] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);

  const loadPage = async (p) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await publicAPI.getMasjidFeed({
        page: p,
        limit,
        cityId,
        areaId,
      });

      const rows = res?.data || [];
      const total = res?.total || 0;

      setMasjids((prev) => [...prev, ...rows]);
      setHasMore(p * limit < total);
      setPage(p);
    } catch (e) {
      console.error("Feed load error", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial + filter change load
  useEffect(() => {
    setMasjids([]);
    setPage(1);
    setHasMore(true);
    loadPage(1);
  }, [cityId, areaId]); // eslint-disable-line

  // Intersection observer
  const setObserver = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadPage(page + 1);
          }
        },
        { rootMargin: "600px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, page]
  );

  return {
    masjids,
    loading,
    hasMore,
    setObserver,
  };
}
