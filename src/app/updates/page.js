// src/app/updates/page.js
"use client";

import { useEffect } from "react";
import { useMasjidStore } from "@/store/useMasjidStore";
import MasjidAnnouncements from "@/components/LeftPanel/MasjidAnnouncements";
import GeneralAnnouncements from "@/components/LeftPanel/GeneralAnnouncements";
import ThoughtOfDay from "@/components/LeftPanel/ThoughtOfDay";

export default function UpdatesPage() {
  const init = useMasjidStore((s) => s.init);
  const selectedMasjid = useMasjidStore((s) => s.selectedMasjid);

  useEffect(() => {
    init(); // ensures masjid loaded even after refresh
  }, [init]);

  const masjidId = selectedMasjid?._id;

  return (
    <div className="min-h-screen w-full bg-slate-300/40 px-3 py-5">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 🔥 Masjid Announcements */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3 text-slate-800">
            Masjid Announcements
          </h2>
          {masjidId ? (
            <MasjidAnnouncements masjidId={masjidId} />
          ) : (
            <p className="text-slate-600 text-sm">
              No masjid selected. Go to Home page once to select.
            </p>
          )}
        </div>

        {/* 🔥 General Announcements */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3 text-slate-800">
            General Announcements
          </h2>
          <GeneralAnnouncements />
        </div>

        {/* 🔥 Thought of the Day */}
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
