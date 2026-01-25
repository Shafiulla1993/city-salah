// src/app/dashboard/masjid-admin/manage/modules/announcements/AnnouncementsTable.js

"use client";

import { useState } from "react";
import EditAnnouncementModal from "./EditAnnouncementModal";
import DeleteAnnouncementModal from "./DeleteAnnouncementModal";

export default function AnnouncementsTable({
  announcements = [],
  masjidId,
  onRefresh,
}) {
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  if (!announcements.length)
    return <p className="text-center text-gray-500 py-6">No announcements</p>;

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div
          key={a._id}
          className="border rounded p-3 flex justify-between items-start"
        >
          <div>
            <p className="font-semibold">{a.title}</p>
            <p className="text-sm text-gray-600">{a.body}</p>
          </div>

          <div className="flex gap-2">
            <button
              className="text-blue-600 text-sm"
              onClick={() => setEdit(a)}
            >
              Edit
            </button>
            <button className="text-red-600 text-sm" onClick={() => setDel(a)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {edit && (
        <EditAnnouncementModal
          open
          announcement={edit}
          masjidId={masjidId}
          onClose={() => setEdit(null)}
          onUpdated={() => {
            setEdit(null);
            onRefresh();
          }}
        />
      )}

      {del && (
        <DeleteAnnouncementModal
          open
          announcement={del}
          masjidId={masjidId}
          onClose={() => setDel(null)}
          onDeleted={() => {
            setDel(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
