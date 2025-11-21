// src/components/LeftPanel/MasjidAnnouncements.js
"use client";
import React, { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export default function MasjidAnnouncements({ masjidId }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!masjidId) return;
    publicAPI
      .getMasjidAnnouncements(masjidId)
      .then(setAnnouncements)
      .catch((err) =>
        console.error("Failed to fetch masjid announcements", err)
      );
  }, [masjidId]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Masjid Announcements</h2>
      {announcements.length === 0 ? (
        <p>No announcements</p>
      ) : (
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a._id} className="border-b border-gray-200 pb-1">
              <p className="font-semibold">{a.title}</p>
              <p>{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
