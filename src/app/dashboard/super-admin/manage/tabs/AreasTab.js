// src/app/dashboard/super-admin/manage/tabs/AreasTab.js
"use client";

import { useEffect, useState, useRef } from "react";
import AreasTable from "../modules/areas/AreasTable";
import AreasSkeleton from "../modules/areas/AreasSkeleton";
import AddAreaModal from "../modules/areas/AddAreaModal";
import EditAreaModal from "../modules/areas/EditAreaModal";
import DeleteAreaModal from "../modules/areas/DeleteAreaModal";

export default function AreasTab() {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);

  const [cities, setCities] = useState([]);

  const loaderRef = useRef();

  useEffect(() => {
    loadAreas(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search, cityId]);

  useEffect(() => {
    if (page === 1) return;
    loadAreas(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/super-admin/cities", {
        credentials: "include",
      });
      const data = await res.json();
      setCities(data?.data || []);
    })();
  }, []);

  async function loadAreas(pageToLoad = 1, reset = false) {
    if (loading || (!hasMore && !reset)) return;
    if (pageToLoad === 1 && areas.length > 0 && !reset) return;

    setLoading(true);

    try {
      const query = `?page=${pageToLoad}&limit=10&sort=${sort}&search=${encodeURIComponent(
        search,
      )}&cityId=${cityId}`;

      const res = await fetch(`/api/super-admin/areas${query}`, {
        credentials: "include",
      });

      const payload = await res.json();
      const newData = payload?.data ?? [];

      if (pageToLoad === 1) {
        setAreas(newData);
      } else {
        setAreas((prev) => {
          const merged = [...prev, ...newData];
          return Array.from(new Map(merged.map((a) => [a._id, a])).values());
        });
      }

      setHasMore(newData.length >= 10);
    } catch (err) {
      console.error("loadAreas error:", err);
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
      { threshold: 1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, hasMore, loading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Manage Areas</h2>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setOpenAdd(true)}
        >
          + Create Area
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Search areas"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setHasMore(true);
          }}
          className="border px-3 py-2 rounded-lg"
        />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
            setHasMore(true);
          }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>

        <select
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setPage(1);
            setHasMore(true);
          }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {loading && areas.length === 0 ? (
          <AreasSkeleton />
        ) : (
          <AreasTable
            areas={areas}
            onEdit={(id) => setEditId(id)}
            onDelete={(id) => setDelId(id)}
          />
        )}

        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
              ? "Scroll to load more"
              : "No more areas"}
        </div>
      </div>

      <AddAreaModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(a) =>
          setAreas((prev) =>
            Array.from(
              new Map([[a._id, a], ...prev.map((p) => [p._id, p])]).values(),
            ),
          )
        }
      />

      <EditAreaModal
        open={!!editId}
        areaId={editId}
        onClose={() => setEditId(null)}
        onUpdated={(updated) =>
          setAreas((prev) =>
            prev.map((a) => (a._id === updated._id ? updated : a)),
          )
        }
      />

      <DeleteAreaModal
        open={!!delId}
        areaId={delId}
        onClose={() => setDelId(null)}
        onDeleted={(id) => {
          setAreas((prev) => prev.filter((a) => a._id !== id));
          setDelId(null);
        }}
      />
    </div>
  );
}
