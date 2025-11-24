// src/app/dashboard/super-admin/manage/modules/masjids/useInfiniteMasjids.js
"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

export function useInfiniteMasjids({
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
  const [areaId, setAreaIdState] = useState("");

  const lockRef = useRef(false);
  const observerRef = useRef(null);
  const observedElRef = useRef(null);

  // Optional: root element for IntersectionObserver (an ancestor scrollable container)
  const rootElementRef = useRef(null);

  const debugLog = (...args) => {
    // comment out to silence
    // console.log("[infiniteMasjids]", ...args);
  };

  const loadPage = useCallback(
    async (p) => {
      if (lockRef.current) {
        debugLog("loadPage blocked by lock", p);
        return;
      }

      lockRef.current = true;
      setLoading(true);
      debugLog("📄 loadPage called", p);

      try {
        const query =
          `?page=${p}&limit=${limit}&sort=${sort}` +
          `&search=${encodeURIComponent(search)}` +
          (cityId ? `&cityId=${cityId}` : "") +
          (areaId ? `&areaId=${areaId}` : "");

        const res = await adminAPI.getMasjids(query);

        debugLog("MASJIDS RESPONSE:", res);

        const rows = Array.isArray(res?.data) ? res.data : [];

        setItems((prev) => {
          const map = new Map();
          [...prev, ...rows].forEach((i) => map.set(i._id, i));
          return [...map.values()];
        });

        const total = typeof res?.total === "number" ? res.total : 0;
        setHasMore(p * limit < total);

        setPage(p);
      } catch (err) {
        console.error("loadPage error:", err);
      } finally {
        setLoading(false);
        // short delay to avoid StrictMode double calls
        setTimeout(() => {
          lockRef.current = false;
        }, 150);
      }
    },
    [limit, sort, search, cityId, areaId]
  );

  const loadFirst = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    lockRef.current = false;
    loadPage(1);
  }, [loadPage]);

  const loadNext = useCallback(() => {
    debugLog("➡️ loadNext called", { page, hasMore, loading });
    if (!hasMore || loading || lockRef.current) return;
    loadPage(page + 1);
  }, [page, hasMore, loading, loadPage]);

  /* ------- Observer attach/detach (exposed as setObserver) ------- */
  const setObserver = (el, options = {}) => {
    // el = sentinel element to observe (the loader)
    // options.root can be passed as a DOM element (scroll container)
    // Example: setObserver(loaderEl, { root: scrollContainerEl })

    // disconnect existing observer
    if (observerRef.current) {
      try {
        observerRef.current.disconnect();
      } catch (e) {}
      observerRef.current = null;
    }

    observedElRef.current = el;

    if (!el) return;

    // allow passing root element explicitly (useful when scrollable ancestor exists)
    const rootEl = options.root || rootElementRef.current || null;

    debugLog("observer attach", { el, rootEl });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // debug each entry
          debugLog("INTERSECTION ENTRY:", {
            isIntersecting: entry.isIntersecting,
            boundingClientRect: entry.boundingClientRect?.top,
          });
          if (entry.isIntersecting) {
            // small debounce guard
            setTimeout(() => {
              loadNext();
            }, 50);
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
      console.error("Observer observe failed:", err);
    }
  };

  const setObserverRoot = (rootEl) => {
    // If you have a scrollable ancestor, set it here (DOM element)
    rootElementRef.current = rootEl;
    // reattach if sentinel exists
    if (observedElRef.current) setObserver(observedElRef.current);
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  return {
    masjids: items,
    loading,
    hasMore,
    loadFirst,
    loadNext,
    setObserver, // attach sentinel via setObserver(el)
    setObserverRoot, // optionally set scroll root element
    sort,
    setSort: (v) => {
      setSortState(v);
      loadFirst();
    },
    search,
    setSearch: (v) => {
      setSearchState(v);
      loadFirst();
    },
    cityId,
    setCityId: (v) => {
      setCityIdState(v);
      loadFirst();
    },
    areaId,
    setAreaId: (v) => {
      setAreaIdState(v);
      loadFirst();
    },
  };
}
