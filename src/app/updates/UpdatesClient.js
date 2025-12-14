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
    init();
  }, [init]);

  const handleShare = () => {
    const baseUrl = window.location.origin;

    const shareUrl = selectedMasjid?._id
      ? `${baseUrl}/updates?masjid=${selectedMasjid._id}`
      : `${baseUrl}/updates`;

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
  };

  return (
    <div className="w-full min-h-screen pt-20 px-3 pb-12 bg-gradient-to-r from-neutral-200 to-neutral-400">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Masjid Announcements */}
        <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">
            Masjid Announcements
          </h2>

          {selectedMasjid?._id ? (
            <MasjidAnnouncements masjidId={selectedMasjid._id} />
          ) : (
            <p className="text-slate-600 text-sm italic">
              No masjid selected. Please visit the Home page to choose one.
            </p>
          )}
        </div>

        {/* General Announcements */}
        <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">
            General Announcements
          </h2>
          <GeneralAnnouncements />
        </div>

        {/* Thought of the Day */}
        <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800">
            Thought of the Day
          </h2>
          <ThoughtOfDay />
        </div>

        {/* Share Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleShare}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md font-semibold"
          >
            Share Updates
          </button>
        </div>
      </div>
    </div>
  );
}
