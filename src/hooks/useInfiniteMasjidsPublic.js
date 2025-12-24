// src/hooks/useInfiniteMasjidsPublic.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export function useInfiniteMasjidsPublic({ limit = 12, cityId, areaId } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const lockRef = useRef(false);
  const observerRef = useRef(null);

  /* ---------------------------
     Load one page
  ---------------------------- */
  const loadPage = useCallback(
    async (p) => {
      if (lockRef.current) return;

      lockRef.current = true;
      setLoading(true);

      try {
        const res = await publicAPI.getMasjidFeed({
          page: p,
          limit,
          cityId,
          areaId,
        });

        const rows = Array.isArray(res?.data) ? res.data : [];
        const total = Number(res?.total || 0);

        setItems((prev) => {
          const map = new Map();
          [...prev, ...rows].forEach((m) => map.set(m._id, m));
          return Array.from(map.values());
        });

        setHasMore(p * limit < total);
        setPage(p);
      } catch (err) {
        console.error("Masjid feed error:", err);
      } finally {
        setLoading(false);
        setTimeout(() => {
          lockRef.current = false;
          tryFillViewport(p + 1);
        }, 150);
      }
    },
    [limit, cityId, areaId]
  );

  /* ---------------------------
     Load next page
  ---------------------------- */
  const loadNext = useCallback(() => {
    if (!hasMore || loading || lockRef.current) return;
    loadPage(page + 1);
  }, [page, hasMore, loading, loadPage]);

  /* ---------------------------
     Fill viewport (zoom-safe)
  ---------------------------- */
  const tryFillViewport = (nextPage) => {
    if (!hasMore || loading || lockRef.current) return;

    const contentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (contentHeight <= viewportHeight + 50) {
      loadPage(nextPage);
    }
  };

  /* ---------------------------
     IntersectionObserver
  ---------------------------- */
  const setObserver = (el) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(loadNext, 50);
          }
        });
      },
      {
        root: null,
        rootMargin: "1200px 0px 800px 0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    observerRef.current = observer;
  };

  /* ---------------------------
     Reset on filter change
  ---------------------------- */
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    lockRef.current = false;
    loadPage(1);
  }, [cityId, areaId]); // eslint-disable-line

  /* ---------------------------
     Handle zoom / resize
  ---------------------------- */
  useEffect(() => {
    const onResize = () => tryFillViewport(page + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [page, hasMore, loading]);

  /* ---------------------------
     Cleanup
  ---------------------------- */
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch {}
      }
    };
  }, []);

  return {
    masjids: items,
    loading,
    hasMore,
    setObserver,
    loadNext,
  };
}
