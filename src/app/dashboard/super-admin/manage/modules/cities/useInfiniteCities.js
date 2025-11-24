// src/app/dashboard/super-admin/manage/modules/cities/useInfiniteCities.js

"use client";

import { useState, useRef, useCallback } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

export function useInfiniteCities({
  initialSort = "-createdAt",
  limit = 10,
} = {}) {
  const [pages, setPages] = useState([]); // array of arrays
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState("");
  const observerRef = useRef(null);

  const loadPage = useCallback(
    async (p = 1, reset = false) => {
      if (loading) return;

      setLoading(true);

      try {
        const q =
          `?page=${p}&limit=${limit}&sort=${sort}` +
          (search ? `&search=${encodeURIComponent(search)}` : "");

        const res = await adminAPI.getCities(q);
        const arr = res?.data ?? [];

        if (reset) setPages([arr]);
        else setPages((s) => [...s, arr]);

        setHasMore((arr?.length ?? 0) >= limit);
        setPage(p);
      } catch (err) {
        console.error("Failed to load city page", err);
      } finally {
        setLoading(false);
      }
    },
    [limit, sort, search]
  );

  const resetAndLoad = async ({ newSort = sort, newSearch = search } = {}) => {
    setPages([]);
    setPage(1);
    setHasMore(true);
    setSort(newSort);
    setSearch(newSearch);
    await loadPage(1, true);
  };

  const loadNext = async () => {
    if (!hasMore || loading) return;
    await loadPage(page + 1);
  };

  const allCities = pages.flat();

  return {
    cities: allCities,
    loading,
    hasMore,
    loadNext,
    resetAndLoad,
    loadFirst: () => loadPage(1, true),

    // setters for filters
    setSort,
    sort,
    setSearch,
    search,

    // intersection observer
    setObserverRef: (el) => {
      if (!el) return;

      if (observerRef.current) observerRef.current.disconnect();

      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadNext();
        },
        { root: null, rootMargin: "200px", threshold: 0.1 }
      );

      obs.observe(el);
      observerRef.current = obs;
    },
  };
}
