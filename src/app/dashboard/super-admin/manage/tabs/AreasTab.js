// src/app/dashboard/super-admin/manage/tabs/AreasTab.js

"use client";

import { useEffect, useRef, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin/index";
import AreasTable from "../modules/areas/AreasTable";
import AddAreaModal from "../modules/areas/AddAreaModal";
import AreasSkeleton from "../modules/areas/AreasSkeleton";

export default function AreasTab() {
  const [areas, setAreas] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);

  const loaderRef = useRef(null);

  useEffect(() => {
    loadAreas();
  }, [page, sort, search, selectedCity]);

  const loadingRef = useRef(false); // prevents double fetch in Strict Mode

  async function loadAreas() {
    if (loadingRef.current) return; // Strict mode guard
    if (loading || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await adminAPI.getAreas(
        `?page=${page}&limit=10&sort=${sort}&search=${search}&cityId=${selectedCity}`
      );

      const data = res?.data ?? [];

      setAreas((prev) => {
        const map = new Map();

        [...prev, ...data].forEach((a) => map.set(a._id, a));

        return Array.from(map.values());
      });

      if (data.length < 10) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loaderRef, hasMore, loading]);

  function resetAndRefresh() {
    setAreas([]);
    setPage(1);
    setHasMore(true);
  }

  console.log(
    "AREAS:",
    areas.map((a) => a._id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Manage Areas</h2>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddModalOpen(true)}
        >
          + Create Area
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          placeholder="Search area"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetAndRefresh();
          }}
          className="border px-3 py-2 rounded-lg"
        />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            resetAndRefresh();
          }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {!areas.length && loading ? (
          <AreasSkeleton />
        ) : (
          <AreasTable
            areas={areas}
            onAreaDeleted={(id) =>
              setAreas((prev) => prev.filter((a) => a._id !== id))
            }
            onAreaUpdated={(obj) =>
              setAreas((prev) => prev.map((a) => (a._id === obj._id ? obj : a)))
            }
          />
        )}

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
            ? "Scroll to load more"
            : "No more areas"}
        </div>
      </div>

      <AddAreaModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={(newArea) => {
          setAreas((prev) => {
            const map = new Map();

            [...prev, ...data].forEach((a) => map.set(a._id, a));

            return Array.from(map.values());
          });
        }}
      />
    </div>
  );
}
