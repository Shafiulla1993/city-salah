// src/app/dashboard/super-admin/manage/tabs/GeneralAnnouncementTab.js

"use client";

import { useEffect, useState } from "react";
import AnnouncementsTable from "../modules/annoucements/AnnouncementsTable";
import AddAnnouncementModal from "../modules/annoucements/AddAnnouncementModal";
import EditAnnouncementModal from "../modules/annoucements/EditAnnouncementModal";
import DeleteAnnouncementModal from "../modules/annoucements/DeleteAnnouncementModal";
import AnnouncementsSkeleton from "../modules/annoucements/AnnouncementsSkeleton";

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/super-admin/general-announcements", {
      credentials: "include",
    });
    const data = await res.json();
    setAnnouncements(data?.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">General Announcements</h2>
        <button
          className="px-4 py-2 bg-slate-700 text-white rounded"
          onClick={() => setOpenAdd(true)}
        >
          + Add Announcement
        </button>
      </div>

      {loading ? (
        <AnnouncementsSkeleton />
      ) : (
        <AnnouncementsTable
          announcements={announcements}
          onEdit={(id) => setEditId(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <AddAnnouncementModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(a) => setAnnouncements((prev) => [a, ...prev])}
      />

      <EditAnnouncementModal
        open={!!editId}
        announcementId={editId}
        onClose={() => setEditId(null)}
        onUpdated={(a) =>
          setAnnouncements((prev) => prev.map((x) => (x._id === a._id ? a : x)))
        }
      />

      <DeleteAnnouncementModal
        open={!!deleteId}
        announcementId={deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={(id) =>
          setAnnouncements((prev) => prev.filter((x) => x._id !== id))
        }
      />
    </div>
  );
}
