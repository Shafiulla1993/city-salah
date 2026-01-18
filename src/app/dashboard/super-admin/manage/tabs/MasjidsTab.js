// src/app/dashboard/super-admin/manage/tabs/MasjidsTab.js
"use client";

import { useEffect, useRef, useState } from "react";
import MasjidsTable from "../modules/masjids/MasjidsTable";
import AddMasjidModal from "../modules/masjids/AddMasjidModal";
import MasjidsSkeleton from "../modules/masjids/MasjidsSkeleton";

export default function MasjidsTab() {
  const [masjids, setMasjids] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  async function fetchMasjids(p = 1, reset = false) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: String(limit),
      sort,
      search,
      ...(cityId && { cityId }),
      ...(areaId && { areaId }),
    });

    const res = await fetch(`/api/super-admin/masjids?${params.toString()}`, {
      credentials: "include",
    });
    const json = await res.json();

    const rows = Array.isArray(json?.data) ? json.data : [];
    setTotal(json?.total || 0);

    setMasjids((prev) => {
      const map = new Map();
      (reset ? rows : [...prev, ...rows]).forEach((m) => {
        map.set(m._id, m);
      });
      return Array.from(map.values());
    });

    setHasMore(p * limit < (json?.total || 0));
    setPage(p);
    setLoading(false);
  }

  async function fetchCitiesAreas() {
    const [cRes, aRes] = await Promise.all([
      fetch(`/api/super-admin/cities?limit=1000`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`/api/super-admin/areas?limit=2000`, {
        credentials: "include",
      }).then((r) => r.json()),
    ]);
    setCities(cRes?.data || []);
    setAreas(aRes?.data || []);
  }

  useEffect(() => {
    fetchCitiesAreas();
  }, []);

  useEffect(() => {
    fetchMasjids(1, true);
  }, [sort, search, cityId, areaId]); // eslint-disable-line

  useEffect(() => {
    if (!loaderRef.current) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMasjids(page + 1);
        }
      },
      { rootMargin: "600px" },
    );

    observerRef.current.observe(loaderRef.current);
    return () => observerRef.current.disconnect();
  }, [page, hasMore, loading]); // eslint-disable-line

  const filteredAreas = areas.filter((a) => !cityId || a.city?._id === cityId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Masjids</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddOpen(true)}
        >
          + Create Masjid
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          className="border px-3 py-2 rounded-lg"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-lg"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
        >
          <option value="">All areas</option>
          {filteredAreas.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {!masjids.length && loading ? (
          <MasjidsSkeleton />
        ) : (
          <MasjidsTable
            masjids={masjids}
            onMasjidUpdated={() => fetchMasjids(1, true)}
            onMasjidDeleted={() => fetchMasjids(1, true)}
          />
        )}
        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
              ? "Scroll to load more"
              : "No more masjids"}
        </div>
      </div>

      <AddMasjidModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        cities={cities}
        areas={areas}
        onCreated={() => fetchMasjids(1, true)}
      />
    </div>
  );
}
