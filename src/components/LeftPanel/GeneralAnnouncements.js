// src/components/LeftPanel/GeneralAnnouncements.js
"use client";
import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export default function GeneralAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const masjidId = localStorage.getItem("selectedMasjidId");
    const areaId = localStorage.getItem("selectedAreaId");
    const cityId = localStorage.getItem("selectedCityId");

    publicAPI
      .getGeneralAnnouncements({ masjidId, areaId, cityId })
      .then(setAnnouncements)
      .catch((err) => console.error("General announcements error:", err));
  }, []);

  return (
    <div>
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
