// src/app/dashboard/masjid-admin/manage/tabs/MasjidsTab.js

"use client";

import { useEffect, useState } from "react";
import MasjidsTable from "../modules/masjids/MasjidsTable";
import MasjidsSkeleton from "../modules/masjids/MasjidsSkeleton";

export default function MasjidsTab() {
  const [masjids, setMasjids] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadMasjids() {
    setLoading(true);
    try {
      const res = await fetch("/api/masjid-admin/masjids", {
        credentials: "include",
      });
      const json = await res.json();
      setMasjids(json?.data || []);
    } catch (err) {
      console.error("Failed to load masjids:", err);
      setMasjids([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasjids();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Masjids</h2>

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <MasjidsSkeleton />
        ) : (
          <MasjidsTable
            masjids={masjids}
            onMasjidUpdated={() => loadMasjids()}
          />
        )}
      </div>
    </div>
  );
}
