// src/app/dashboard/super-admin/manage/modules/areas/useInfiniteAreas.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

/**
 * Infinite loader for AREAS (same structure as useInfiniteMasjids)
 */
export function useInfiniteAreas({
  initialSort = "-createdAt",
  limit = 10,
} = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [sort, setSortState] = useState(initialSort);
  const [search, setSearchState] = useState("");
  const [cityId, setCityIdState] = useState("");

  const lockRef = useRef(false); // prevents duplicate loads
  const observerRef = useRef(null);
  const observedElRef = useRef(null);
  const rootElementRef = useRef(null);

  const debug = (...args) => {
    // console.log("[areas]", ...args);
  };

  /* ----------------------------------------
   * Load one page
   * ---------------------------------------- */
  const loadPage = useCallback(
    async (p) => {
      if (lockRef.current) {
        debug("⛔ loadPage blocked (lock)");
        return;
      }

      lockRef.current = true;
      setLoading(true);
      debug("📄 Fetching page:", p);

      try {
        const params = new URLSearchParams();
        params.set("page", p);
        params.set("limit", limit);
        params.set("sort", sort);
        if (search) params.set("search", search);
        if (cityId) params.set("cityId", cityId);

        const res = await adminAPI.getAreas(`?${params.toString()}`);
        debug("RESPONSE:", res);

        const rows = Array.isArray(res?.data) ? res.data : [];

        // merge + dedupe by _id
        setItems((prev) => {
          const map = new Map();
          [...prev, ...rows].forEach((r) => map.set(r._id, r));
          return [...map.values()];
        });

        const total = Number(res?.total || 0);
        setHasMore(p * limit < total);

        setPage(p);
      } catch (err) {
        console.error("loadPage error:", err);
      } finally {
        setLoading(false);
        // short unlock delay to avoid StrictMode double-fire
        setTimeout(() => {
          lockRef.current = false;
        }, 150);
      }
    },
    [limit, sort, search, cityId]
  );

  /* ----------------------------------------
   * Reload from page 1
   * ---------------------------------------- */
  const loadFirst = useCallback(() => {
    debug("🔄 loadFirst()");
    lockRef.current = false;
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadPage(1);
  }, [loadPage]);

  /* ----------------------------------------
   * Load next page
   * ---------------------------------------- */
  const loadNext = useCallback(() => {
    debug("➡ loadNext()", { page, hasMore, loading });
    if (!hasMore || loading || lockRef.current) return;
    loadPage(page + 1);
  }, [page, hasMore, loading, loadPage]);

  /* ----------------------------------------
   * Attach intersection observer
   * ---------------------------------------- */
  const setObserver = (el, options = {}) => {
    // disconnect previous observer
    if (observerRef.current) {
      try {
        observerRef.current.disconnect();
      } catch (e) {}
      observerRef.current = null;
    }

    observedElRef.current = el;

    if (!el) return;

    const rootEl = options.root || rootElementRef.current || null;

    debug("👀 Observing sentinel:", el, "root:", rootEl);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          debug("ENTRY:", entry.isIntersecting);
          if (entry.isIntersecting) {
            setTimeout(() => loadNext(), 60);
          }
        });
      },
      {
        root: rootEl,
        rootMargin: options.rootMargin ?? "800px 0px 400px 0px",
        threshold: options.threshold ?? 0,
      }
    );

    try {
      observer.observe(el);
      observerRef.current = observer;
    } catch (err) {
      console.error("Observer error:", err);
    }
  };

  /* ----------------------------------------
   * Optional custom scroll root
   * ---------------------------------------- */
  const setObserverRoot = (rootEl) => {
    rootElementRef.current = rootEl;
    if (observedElRef.current) {
      setObserver(observedElRef.current);
    }
  };

  /* ----------------------------------------
   * Cleanup
   * ---------------------------------------- */
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch {}
      }
    };
  }, []);

  /* ----------------------------------------
   * Auto reload when filters change
   * ---------------------------------------- */
  useEffect(() => {
    loadFirst();
  }, [sort, search, cityId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------
   * Export API
   * ---------------------------------------- */
  return {
    areas: items,
    loading,
    hasMore,
    loadFirst,
    loadNext,
    setObserver,
    setObserverRoot,

    sort,
    setSort: (v) => setSortState(v),

    search,
    setSearch: (v) => setSearchState(v),

    cityId,
    setCityId: (v) => setCityIdState(v),
  };
}
