// src/components/LeftPanel/GeneralAnnouncements.js
"use client";
import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function GeneralAnnouncements() {
  const selectedMasjid = useMasjidStore((s) => s.selectedMasjid);
  const selectedArea = useMasjidStore((s) => s.selectedArea);
  const selectedCity = useMasjidStore((s) => s.selectedCity);

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    publicAPI
      .getGeneralAnnouncements({
        masjidId: selectedMasjid?._id,
        areaId: selectedArea,
        cityId: selectedCity,
      })
      .then(setAnnouncements)
      .catch((err) => console.error("General announcements error:", err));
  }, [selectedMasjid?._id, selectedArea, selectedCity]);

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
