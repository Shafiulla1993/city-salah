// src/app/dashboard/super-admin/manage/modules/areas/useInfiniteAreas.js
"use client";

import { useState, useRef, useCallback } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

export function useInfiniteAreas({ limit = 10 } = {}) {
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

  const loadPage = useCallback(
    async (p = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const res = await adminAPI.getAreas(`?page=${p}&limit=${limit}`);
        const arr = res?.data ?? [];

        if (reset) {
          setPages([arr]); // replace, don't append
        } else {
          setPages((prev) => [...prev, arr]); // append next page
        }

        setHasMore(arr.length === limit);
        setPage(p);
      } finally {
        setLoading(false);
      }
    },
    [limit, loading]
  );

  // For first load only
  const loadFirst = useCallback(() => {
    setPages([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, true);
  }, [loadPage]);

  const loadNext = useCallback(() => {
    if (loading || !hasMore) return;
    loadPage(page + 1);
  }, [loading, hasMore, loadPage, page]);

  const setObserverEl = (el) => {
    if (!el) return;
    if (observerRef.current) observerRef.current.disconnect();

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNext();
        }
      },
      { threshold: 0.5 }
    );

    obs.observe(el);
    observerRef.current = obs;
  };

  return {
    areas: pages.flat(),
    loading,
    hasMore,
    loadFirst,
    loadNext,
    setObserverEl,
  };
}
