// src/app/dashboard/masjid-admin/manage/tabs/MasjidsTab.js

"use client";

import { useEffect, useState } from "react";
import { mAdminAPI } from "@/lib/api/mAdmin";
import MasjidsTable from "../modules/masjids/MasjidsTable";
import MasjidsSkeleton from "../modules/masjids/MasjidsSkeleton";

export default function MasjidsTab() {
  const [masjids, setMasjids] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await mAdminAPI.getMyMasjids();
      setMasjids(res?.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      {loading ? (
        <MasjidsSkeleton />
      ) : (
        <MasjidsTable masjids={masjids} onMasjidUpdated={() => load()} />
      )}
    </div>
  );
}
