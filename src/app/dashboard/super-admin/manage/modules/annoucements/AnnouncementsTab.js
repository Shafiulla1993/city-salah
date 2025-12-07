// src/app/dashboard/super-admin/manage/tabs/AnnouncementsTab.js

// src/app/dashboard/super-admin/manage/tabs/AnnouncementsTab.js

"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";
import { useInfiniteAnnouncements } from "./useInfiniteAnnouncements";
import AnnouncementsTable from "./AnnouncementsTable";
import AnnouncementsSkeleton from "./AnnouncementsSkeleton";
import AddAnnouncementModal from "./AddAnnouncementModal";
import EditAnnouncementModal from "./EditAnnouncementModal";
import DeleteAnnouncementModal from "./DeleteAnnouncementModal";

export default function AnnouncementsTab() {
  const {
    announcements,
    loading,
    hasMore,
    loadNext,
    resetAndLoad,
    search,
    setSearch,
    cityId,
    setCityId,
    status,
    setStatus,
    setObserverRef,
  } = useInfiniteAnnouncements({ limit: 10 });

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  // load dropdown data once
  useEffect(() => {
    (async () => {
      try {
        const [cRes, aRes, mRes] = await Promise.all([
          adminAPI.getCities(),
          adminAPI.getAreas("?limit=2000"),
          adminAPI.getMasjids("?page=1&limit=5000"),
        ]);

        setCities(cRes?.data ?? []);
        setAreas(aRes?.data ?? []);
        setMasjids(mRes?.data ?? []);
      } catch (err) {
        console.error(
          "Failed to load cities/areas/masjids for announcements:",
          err
        );
      }
    })();
  }, []);

  // initial load
  useEffect(() => {
    resetAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when filters change
  function handleApplyFilters() {
    resetAndLoad();
  }

  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">
          General Announcements
        </h2>

        <button
          className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm"
          onClick={() => setOpenAdd(true)}
        >
          + Add Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="border px-3 py-2 rounded-lg text-sm"
          placeholder="Search title or body"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-lg text-sm"
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

        {/* Status filter */}
        <select
          className="border px-3 py-2 rounded-lg text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="expired">Expired</option>
        </select>

        <button
          type="button"
          onClick={handleApplyFilters}
          className="px-3 py-2 text-sm border rounded-lg bg-slate-50 hover:bg-slate-100"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      {loading && !safeAnnouncements.length ? (
        <AnnouncementsSkeleton />
      ) : (
        <AnnouncementsTable
          announcements={safeAnnouncements}
          onEdit={(id) => setEditId(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div
          ref={setObserverRef}
          className="h-10 flex justify-center items-center text-gray-400 text-sm"
        >
          {loading ? "Loading..." : "Scroll to load more"}
        </div>
      )}

      {/* Modals */}
      <AddAnnouncementModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={resetAndLoad}
        cities={cities}
        areas={areas}
        masjids={masjids}
      />

      <EditAnnouncementModal
        open={!!editId}
        onClose={() => setEditId(null)}
        announcementId={editId}
        onUpdated={resetAndLoad}
        cities={cities}
        areas={areas}
        masjids={masjids}
      />

      <DeleteAnnouncementModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        announcementId={deleteId}
        onDeleted={resetAndLoad}
      />
    </div>
  );
}
