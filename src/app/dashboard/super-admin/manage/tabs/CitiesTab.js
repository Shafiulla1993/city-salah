// File: src/app/dashboard/super-admin/manage/tabs/CitiesTab.js
"use client";

import { useEffect, useState, useRef } from "react";
import { adminAPI } from "@/lib/api/sAdmin";
import CitiesTable from "../modules/cities/CitiesTable";
import CitiesSkeleton from "../modules/cities/CitiesSkeleton";
import AddCityModal from "../modules/cities/AddCityModal";
import EditCityModal from "../modules/cities/EditCityModal";
import DeleteCityModal from "../modules/cities/DeleteCityModal";

export default function CitiesTab() {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);

  const [delId, setDelId] = useState(null);

  const loaderRef = useRef();

  useEffect(() => {
    loadCities(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search]);

  useEffect(() => {
    if (page === 1) return;
    loadCities(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadCities(pageToLoad = 1, reset = false) {
    if (loading || (!hasMore && !reset)) return;
    if (pageToLoad === 1 && cities.length > 0 && !reset) return;

    setLoading(true);

    try {
      const query = `?page=${pageToLoad}&limit=10&sort=${sort}&search=${encodeURIComponent(
        search
      )}`;
      const payload = await adminAPI.getCities(query);
      const newData = payload?.data ?? [];

      if (pageToLoad === 1) {
        setCities(newData);
      } else {
        setCities((prev) => {
          const merged = [...prev, ...newData];
          return Array.from(new Map(merged.map((c) => [c._id, c])).values());
        });
      }

      setHasMore(newData.length >= 10);
    } catch (err) {
      console.error("loadCities error:", err);
    } finally {
      setLoading(false);
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

  function handleSortChange(e) {
    setSort(e.target.value);
    setPage(1);
    setHasMore(true);
    loadCities(1, true);
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
    setHasMore(true);
    loadCities(1, true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Manage Cities</h2>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setOpenAdd(true)}
        >
          + Create City
        </button>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Search cities"
          value={search}
          onChange={handleSearchChange}
          className="border px-3 py-2 rounded-lg"
        />

        <select
          value={sort}
          onChange={handleSortChange}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {loading && cities.length === 0 ? (
          <CitiesSkeleton />
        ) : (
          <CitiesTable
            cities={cities}
            onEdit={(id) => setEditId(id)}
            onDelete={(id) => setDelId(id)}
          />
        )}

        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
            ? "Scroll to load more"
            : "No more cities"}
        </div>
      </div>

      <AddCityModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(c) =>
          setCities((prev) =>
            Array.from(
              new Map([[c._id, c], ...prev.map((p) => [p._id, p])]).values()
            )
          )
        }
      />

      <EditCityModal
        open={!!editId}
        cityId={editId}
        onClose={() => setEditId(null)}
        onUpdated={(updated) =>
          setCities((prev) =>
            prev.map((c) => (c._id === updated._id ? updated : c))
          )
        }
      />

      <DeleteCityModal
        open={!!delId}
        cityId={delId}
        onClose={() => setDelId(null)}
        onDeleted={(id) => {
          setCities((prev) => prev.filter((c) => c._id !== id));
          setDelId(null);
        }}
      />
    </div>
  );
}
