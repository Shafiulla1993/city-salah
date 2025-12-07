// src/app/dashboard/super-admin/manage/modules/thoughts/useInfiniteThoughts.js
"use client";

import { useState, useRef } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

export function useInfiniteThoughts({ limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const observerRef = useRef(null);
  const lockRef = useRef(false);

  async function load(p = 1, reset = false) {
    if (loading || lockRef.current) return;
    lockRef.current = true;
    setLoading(true);

    try {
      const query =
        `?page=${p}&limit=${limit}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");

      const res = await adminAPI.getThoughts(query);
      console.log("THOUGHTS API RAW RESPONSE:", res);

      // 🔥 normalize API shape
      const json = res?.json ?? {};
      const rows = Array.isArray(json?.data) ? json.data : [];
      const total = typeof json?.total === "number" ? json.total : rows.length;

      setItems((prev) => (reset ? rows : [...prev, ...rows]));
      setHasMore(p * limit < total);
      setPage(p);
    } catch (err) {
      console.error("thoughts load error:", err);
    } finally {
      setLoading(false);
      setTimeout(() => (lockRef.current = false), 150);
    }
  }

  const resetAndLoad = () => load(1, true);
  const loadNext = () => hasMore && !loading && load(page + 1);

  return {
    thoughts: items,
    loading,
    hasMore,
    loadNext,
    resetAndLoad,
    search,
    setSearch: (v) => {
      setSearch(v);
      resetAndLoad();
    },
    setObserverRef: (el) => {
      if (!el) return;
      if (observerRef.current) observerRef.current.disconnect();

      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadNext();
      });

      obs.observe(el);
      observerRef.current = obs;
    },
  };
}
