// src/app/dashboard/masjid-admin/manage/tabs/AnnouncementsTab.js

"use client";

import { useEffect, useState } from "react";
import { mAdminAPI } from "@/lib/api/mAdmin";
import AnnouncementsTable from "../modules/announcements/AnnouncementsTable";
import AnnouncementsSkeleton from "../modules/announcements/AnnouncementsSkeleton";
import AddAnnouncementModal from "../modules/announcements/AddAnnouncementModal";
import EditAnnouncementModal from "../modules/announcements/EditAnnouncementModal";
import DeleteAnnouncementModal from "../modules/announcements/DeleteAnnouncementModal";
import { notify } from "@/lib/toast";

export default function AnnouncementsTab() {
  const [masjids, setMasjids] = useState([]);
  const [masjidId, setMasjidId] = useState("");
  const [ann, setAnn] = useState([]);

  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  /** 🔥 Load masjids assigned to admin */
  async function loadMasjids() {
    try {
      const res = await mAdminAPI.getMyMasjids();
      const list = res?.data ?? [];
      setMasjids(list);
      if (list.length) {
        setMasjidId(list[0]._id); // default first masjid
        await loadAnnouncements(list[0]._id);
      }
    } catch {
      notify.error("Failed to load masjids");
    }
  }

  /** 🔥 Load announcements for selected masjid */
  async function loadAnnouncements(id) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await mAdminAPI.getAnnouncements(id);
      setAnn(res?.data ?? []);
    } catch {
      notify.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasjids();
  }, []);

  /** Masjid dropdown change */
  async function onMasjidChange(id) {
    setMasjidId(id);
    await loadAnnouncements(id);
  }

  return (
    <div className="space-y-4">
      {/* HEADER: Masjid selector + create button */}
      <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Masjid
          </label>
          <select
            className="border px-3 py-2 rounded-lg"
            value={masjidId}
            onChange={(e) => onMasjidChange(e.target.value)}
          >
            {masjids.length ? (
              masjids.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))
            ) : (
              <option>No masjids assigned</option>
            )}
          </select>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg"
          disabled={!masjidId}
        >
          + New Announcement
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <AnnouncementsSkeleton />
      ) : (
        <AnnouncementsTable
          announcements={ann}
          onEdit={(id) => setEditId(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* MODALS */}
      <AddAnnouncementModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        masjidId={masjidId}
        onCreated={() => loadAnnouncements(masjidId)}
      />

      <EditAnnouncementModal
        open={!!editId}
        announcementId={editId}
        onClose={() => setEditId(null)}
        onUpdated={() => loadAnnouncements(masjidId)}
      />

      <DeleteAnnouncementModal
        open={!!deleteId}
        announcementId={deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => loadAnnouncements(masjidId)}
      />
    </div>
  );
}
