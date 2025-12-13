// src/app/updates/UpdatesClient.js

"use client";

import { useEffect } from "react";
import { useMasjidStore } from "@/store/useMasjidStore";
import MasjidAnnouncements from "@/components/updates/MasjidAnnouncements";
import GeneralAnnouncements from "@/components/updates/GeneralAnnouncements";
import ThoughtOfDay from "@/components/updates/ThoughtOfDay";

export default function UpdatesClient() {
  const init = useMasjidStore((s) => s.init);
  const selectedMasjid = useMasjidStore((s) => s.selectedMasjid);

  useEffect(() => {
    init(); // ensures masjid loaded even after refresh
  }, [init]);

  const masjidId = selectedMasjid?._id;

  return (
    <div className="min-h-screen w-full px-3 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Masjid Announcements */}
        <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-wide">
            Masjid Announcements
          </h2>
          {masjidId ? (
            <MasjidAnnouncements masjidId={masjidId} />
          ) : (
            <p className="text-slate-600 text-sm italic">
              No masjid selected. Please visit the Home page to choose one.
            </p>
          )}
        </div>

        {/* General Announcements */}
        <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-wide">
            General Announcements
          </h2>
          <GeneralAnnouncements />
        </div>

        {/* Thought of the Day */}
        <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-wide">
            Thought of the Day
          </h2>
          <ThoughtOfDay />
        </div>
        <button
  onClick={() => {
    const masjidName = selectedMasjid?.name || "";
    const url = `/api/og/updates${
      masjidName ? `?masjid=${encodeURIComponent(masjidName)}` : ""
    }`;

    const shareUrl = `${window.location.origin}${url}`;

    if (navigator.share) {
      navigator.share({
        title: "CitySalah Updates",
        text: "Latest masjid and community announcements",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Share link copied!");
    }
  }}
  className="mb-4 bg-blue-600 text-white px-6 py-2 rounded-md shadow"
>
  Share Updates
</button>

      </div>
    </div>
  );
}


