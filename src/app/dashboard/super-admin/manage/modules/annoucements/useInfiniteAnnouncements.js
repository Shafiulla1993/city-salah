// src/app/dashboard/super-admin/manage/modules/announcements/useInfiniteAnnouncements.js

"use client";

import { useState, useRef } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

export function useInfiniteAnnouncements({ limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [search, setSearchState] = useState("");
  const [cityId, setCityIdState] = useState("");
  const [activeOnly, setActiveOnlyState] = useState(false);

  const observerRef = useRef(null);
  const lockRef = useRef(false);

  async function load(p = 1, reset = false) {
    if (loading || lockRef.current) return;
    lockRef.current = true;
    setLoading(true);

    try {
      let query = `?page=${p}&limit=${limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (cityId) query += `&cityId=${cityId}`;
      if (activeOnly) query += `&activeOnly=true`;

      const res = await adminAPI.getAnnouncements(query);

      // The API returns results inside res.json
      const payload = res?.json || {};

      const rows = Array.isArray(payload.data) ? payload.data : [];
      const total =
        typeof payload.total === "number" ? payload.total : rows.length;

      setItems((prev) => (reset ? rows : [...prev, ...rows]));
      setHasMore(p * limit < total);
      setPage(p);
    } catch (err) {
      console.error("announcements load error:", err);
    } finally {
      setLoading(false);
      setTimeout(() => {
        lockRef.current = false;
      }, 150);
    }
  }

  const resetAndLoad = () => load(1, true);
  const loadNext = () => hasMore && !loading && load(page + 1);

  return {
    announcements: items,
    loading,
    hasMore,
    loadNext,
    resetAndLoad,

    search,
    setSearch: (v) => setSearchState(v),
    cityId,
    setCityId: (v) => setCityIdState(v),
    activeOnly,
    setActiveOnly: (v) => setActiveOnlyState(v),

    setObserverRef: (el) => {
      if (!el) return;
      if (observerRef.current) observerRef.current.disconnect();

      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadNext();
        },
        { threshold: 0 }
      );

      obs.observe(el);
      observerRef.current = obs;
    },
  };
}
