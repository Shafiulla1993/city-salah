// src/app/dashboard/masjid-admin/manage/tabs/AnnouncementsTab.js

"use client";

import { useEffect, useState } from "react";
import AnnouncementsTable from "../modules/announcements/AnnouncementsTable";
import AddAnnouncementModal from "../modules/announcements/AddAnnouncementModal";

export default function AnnouncementsTab() {
  const [masjids, setMasjids] = useState([]);
  const [activeMasjid, setActiveMasjid] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function loadMasjids() {
    const res = await fetch("/api/masjid-admin/masjids", {
      credentials: "include",
    });
    const json = await res.json();
    const list = json?.data || [];
    setMasjids(list);
    if (list.length) setActiveMasjid(list[0]._id);
  }

  async function loadAnnouncements(masjidId) {
    if (!masjidId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/masjid-admin/masjids/${masjidId}/announcements`,
        { credentials: "include" },
      );
      const json = await res.json();
      setAnnouncements(json?.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasjids();
  }, []);

  useEffect(() => {
    if (activeMasjid) loadAnnouncements(activeMasjid);
  }, [activeMasjid]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Announcements</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setOpen(true)}
        >
          + Add Announcement
        </button>
      </div>

      <select
        className="border px-3 py-2 rounded"
        value={activeMasjid}
        onChange={(e) => setActiveMasjid(e.target.value)}
      >
        {masjids.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>

      <AnnouncementsTable
        loading={loading}
        announcements={announcements}
        onDelete={() => loadAnnouncements(activeMasjid)}
      />

      <AddAnnouncementModal
        open={open}
        onClose={() => setOpen(false)}
        masjidId={activeMasjid}
        onCreated={() => loadAnnouncements(activeMasjid)}
      />
    </div>
  );
}
