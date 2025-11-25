// src/app/dashboard/super-admin/manage/tabs/AreasTab.js
"use client";

import { useEffect, useRef, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

import AreasTable from "../modules/areas/AreasTable";
import AddAreaModal from "../modules/areas/AddAreaModal";
import AreasSkeleton from "../modules/areas/AreasSkeleton";

import { useInfiniteAreas } from "../modules/areas/useInfiniteAreas";

export default function AreasTab() {
  const {
    areas,
    loading,
    hasMore,
    loadFirst,
    setObserver,
    sort,
    setSort,
    search,
    setSearch,
    cityId,
    setCityId,
  } = useInfiniteAreas({ initialSort: "-createdAt", limit: 10 });

  const [cities, setCities] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const loaderRef = useRef(null);

  /* -------------------------------------------------
   * Load Cities Dropdown (once)
   * ------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const cRes = await adminAPI.getCities();
        setCities(cRes?.data ?? []);
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    })();
  }, []);

  /* -------------------------------------------------
   * FIRST PAGE LOAD
   * ------------------------------------------------- */
  useEffect(() => {
    loadFirst();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* -------------------------------------------------
   * Attach IntersectionObserver
   * ------------------------------------------------- */
  const attachLoader = (el) => {
    loaderRef.current = el;
    setObserver(el); // hook's intersection observer
  };

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
      <div className="flex gap-3 flex-wrap">
        {/* Search */}
        <input
          placeholder="Search area"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>

        {/* City Filter */}
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow p-4">
        {!areas.length && loading ? (
          <AreasSkeleton />
        ) : (
          <AreasTable
            areas={areas}
            onAreaDeleted={() => loadFirst()}
            onAreaUpdated={() => loadFirst()}
          />
        )}

        {/* Infinite Scroll Loader */}
        <div ref={attachLoader} className="py-6 mt-8 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
            ? "Scroll to load more"
            : "No more areas"}
        </div>
      </div>

      {/* Add Area Modal */}
      <AddAreaModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={() => loadFirst()}
      />
    </div>
  );
}
