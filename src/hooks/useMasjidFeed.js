// src/hooks/useMasjidFeed.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useMasjidFeed({ limit = 12, cityId, areaId } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

  const loadPage = useCallback(
    async (p) => {
      if (loading) return;
      setLoading(true);

      const params = new URLSearchParams({
        mode: "feed",
        page: p,
        limit,
      });
      if (cityId) params.append("cityId", cityId);
      if (areaId) params.append("areaId", areaId);

      const res = await fetch(`/api/public/masjids?${params.toString()}`);
      const json = await res.json();

      setItems((prev) => {
        const map = new Map();
        [...prev, ...json.data].forEach((m) => map.set(m._id, m));
        return Array.from(map.values());
      });

      setHasMore(p * limit < json.total);
      setPage(p);
      setLoading(false);
    },
    [limit, cityId, areaId, loading],
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadPage(1);
  }, [cityId, areaId]); // reset when filter changes

  const setObserver = (el) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadPage(page + 1);
      }
    });

    observer.observe(el);
    observerRef.current = observer;
  };

  return {
    masjids: items,
    loading,
    hasMore,
    setObserver,
    loadNext: () => loadPage(page + 1),
  };
}
