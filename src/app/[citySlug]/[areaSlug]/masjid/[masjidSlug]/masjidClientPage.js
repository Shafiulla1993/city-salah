// src/app/[citySlug]/[areaSlug]/masjid/[masjidSlug]/MasjidClientPage.js

"use client";

import { useEffect, useState } from "react";
import MasjidDetailsLayout from "@/components/masjid/MasjidDetailsLayout";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";

export default function MasjidClientPage({ citySlug, areaSlug, masjidSlug }) {
  const [masjid, setMasjid] = useState(null);
  const [masjidTimings, setMasjidTimings] = useState(null);
  const [generalTimings, setGeneralTimings] = useState([]);

  useEffect(() => {
    async function load() {
      const masjidRes = await fetch(
        `/api/public/masjids?mode=by-slug&citySlug=${citySlug}&areaSlug=${areaSlug}&masjidSlug=${masjidSlug}`,
      ).then((r) => r.json());

      setMasjid(masjidRes);

      const timingsRes = await fetch(
        `/api/public/timings?masjidId=${masjidRes.masjid._id}`,
      ).then((r) => r.json());

      setMasjidTimings(timingsRes.data);

      const generalRes = await fetch(
        `/api/public/prayer-timings/today?citySlug=${citySlug}&areaSlug=${areaSlug}`,
        { cache: "no-store" },
      ).then((r) => r.json());

      const normalized = normalizeGeneralTimings(generalRes);
      setGeneralTimings(normalized);
    }

    load();
  }, [citySlug, areaSlug, masjidSlug]);

  if (!masjid || !masjidTimings) return null;

  return (
    <MasjidDetailsLayout
      masjid={masjid.masjid}
      masjidTimings={masjidTimings}
      generalTimings={generalTimings}
    />
  );
}
