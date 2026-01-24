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
    <>
  {/* SEO Visible Content */}
  <section className="sr-only">
    <h1>
      {masjid.masjid.name} Masjid in {masjid.area.name}, {masjid.city.name}
    </h1>

    <p>
      {masjid.masjid.name} is a mosque located in {masjid.area.name}, {masjid.city.name}.
      Find daily prayer timings for Fajr, Zohar, Asr, Maghrib and Isha, Jumma time,
      address and directions.
    </p>

    <h2>Prayer Timings of {masjid.masjid.name} in {masjid.area.name}</h2>
    <h3>Nearest Masjid in {masjid.area.name}, {masjid.city.name}</h3>
  </section>

  <MasjidDetailsLayout
  masjid={{
    ...masjid.masjid,
    city: masjid.city,
    area: masjid.area,
  }}
  masjidTimings={masjidTimings}
  generalTimings={generalTimings}
/>

</>

  );
}
