// src/app/updates/page.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import MasjidAnnouncements from "@/components/LeftPanel/MasjidAnnouncements";
import GeneralAnnouncements from "@/components/LeftPanel/GeneralAnnouncements";
import ThoughtOfDay from "@/components/LeftPanel/ThoughtOfDay";

export default function UpdatesPage() {
  const [selectedMasjidId, setSelectedMasjidId] = useState(null);

  // Get masjid ID from localStorage if user selected one earlier
  useEffect(() => {
    const storedId = localStorage.getItem("selectedMasjidId");
    if (storedId) setSelectedMasjidId(storedId);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-300/40 px-3 py-5">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 🔥 1 — MASJID ANNOUNCEMENTS (highest priority) */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3 text-slate-800">
            Masjid Announcements
          </h2>
          {selectedMasjidId ? (
            <MasjidAnnouncements masjidId={selectedMasjidId} />
          ) : (
            <p className="text-slate-600 text-sm">
              No masjid selected. Please visit home page and select a masjid
              once.
            </p>
          )}
        </div>

        {/* 🔥 2 — GENERAL ANNOUNCEMENTS */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3 text-slate-800">
            General Announcements
          </h2>
          <GeneralAnnouncements />
        </div>

        {/* 🔥 3 — THOUGHT OF THE DAY */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3 text-slate-800">
            Thought of the Day
          </h2>
          <ThoughtOfDay />
        </div>
      </div>
    </div>
  );
}
