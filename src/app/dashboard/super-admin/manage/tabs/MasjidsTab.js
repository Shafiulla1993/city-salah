// src/app/dashboard/super-admin/manage/tabs/MasjidsTab.js
"use client";

import { useEffect, useRef, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

import MasjidsTable from "../modules/masjids/MasjidsTable";
import AddMasjidModal from "../modules/masjids/AddMasjidModal";
import MasjidsSkeleton from "../modules/masjids/MasjidsSkeleton";
import { useInfiniteMasjids } from "../modules/masjids/useInfiniteMasjids";

export default function MasjidsTab() {
  const {
    masjids,
    loading,
    hasMore,
    loadFirst,
    loadNext,
    setObserver,
    setObserverRoot,
    sort,
    setSort,
    search,
    setSearch,
    cityId,
    setCityId,
    areaId,
    setAreaId,
  } = useInfiniteMasjids({ initialSort: "-createdAt", limit: 10 });

  const [addOpen, setAddOpen] = useState(false);

  // Dropdown data
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  // Use callback ref to attach observer reliably
  const loaderRef = useRef(null);

  // If your app has a specific scrollable container, try to detect it here:
  useEffect(() => {
    // Example: if your layout uses a div with id "main-scroll" or class ".app-scroll"
    // const scrollContainer = document.querySelector("#main-scroll") || document.querySelector(".app-scroll");
    // if (scrollContainer) setObserverRoot(scrollContainer);
    // For now, we attempt to auto-detect a common scroll container:
    const maybe = document.querySelector(
      ".main-content, .app-scroll, .scrollable, #__next"
    );
    if (maybe) {
      // If that element has overflowY other than 'visible', it's likely the scroll root
      const style = getComputedStyle(maybe);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        setObserverRoot(maybe);
      }
    }
  }, [setObserverRoot]);

  // callback ref that will call setObserver when element mounts
  const attachLoader = (el) => {
    loaderRef.current = el;
    if (el) {
      // attach sentinel to observer
      setObserver(el);
    } else {
      // if unmounted, detach by calling setObserver(null)
      setObserver(null);
    }
  };

  /* ----------------------------------------------------
   *  Load dropdown data (cities + areas) once
   * ---------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          adminAPI.getCities(),
          adminAPI.getAreas("?limit=2000"),
        ]);

        setCities(cRes?.data ?? []);
        setAreas(aRes?.data ?? []);
      } catch (err) {
        console.error("Failed cities/areas:", err);
      }
    })();
  }, []);

  /* ----------------------------------------------------
   * Initial load of masjids
   * ---------------------------------------------------- */
  useEffect(() => {
    loadFirst();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------
   * Reload when filters change
   * ---------------------------------------------------- */
  useEffect(() => {
    loadFirst();
  }, [sort, search, cityId, areaId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Window-scroll fallback: if intersection doesn't trigger (some layouts), this will load more
  useEffect(() => {
    let ticking = false;

    function onScrollFallback() {
      if (!hasMore || loading) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // distance from bottom
        const distance =
          document.documentElement.scrollHeight -
          (window.innerHeight + window.scrollY);
        // when within 900px from bottom, load next
        if (distance < 900) {
          loadNext();
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScrollFallback, { passive: true });
    return () => window.removeEventListener("scroll", onScrollFallback);
  }, [hasMore, loading, loadNext]);

  /* ----------------------------------------------------
   * Safe masjid list
   * ---------------------------------------------------- */
  const safeMasjids = Array.isArray(masjids) ? masjids : [];

  const filteredAreas = areas.filter((a) => !cityId || a.city?._id === cityId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Manage Masjids</h2>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddOpen(true)}
        >
          + Create Masjid
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="border px-3 py-2 rounded-lg"
          placeholder="Search masjid or address"
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

        {/* City Filter */}
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

        {/* Area Filter */}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4">
        {!safeMasjids.length && loading ? (
          <MasjidsSkeleton />
        ) : (
          <MasjidsTable
            masjids={safeMasjids}
            onMasjidDeleted={() => loadFirst()}
            onMasjidUpdated={() => loadFirst()}
          />
        )}

        {/* Infinite scroll loader */}
        {/* use callback ref attachLoader so observer always attaches reliably */}
        <div ref={attachLoader} className="py-6 mt-8 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
            ? "Scroll to load more"
            : "No more masjids"}
        </div>
      </div>

      {/* Add Modal */}
      <AddMasjidModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        cities={cities}
        areas={areas}
        onCreated={() => loadFirst()}
      />
    </div>
  );
}
