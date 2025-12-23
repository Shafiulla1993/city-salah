// src/app/nearest-masjid/NearestMasjidClient.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import MasjidDetailsLayout from "@/components/masjid/MasjidDetailsLayout";
import { MasjidCardSkeleton } from "@/components/masjid/loaders";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";

export default function NearestMasjidClient() {
  const [loading, setLoading] = useState(true);
  const [masjid, setMasjid] = useState(null);
  const [masjidTimings, setMasjidTimings] = useState(null);
  const [generalTimings, setGeneralTimings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location not supported on this device.");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          /* 1️⃣ Find nearest masjid (lightweight) */
          const nearest = await publicAPI.getNearestMasjids({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            limit: 1,
          });

          if (!nearest?.length) {
            setError("No nearby masjid found.");
            return;
          }

          /* 2️⃣ Fetch FULL masjid document */
          const fullMasjid = await publicAPI.getMasjidById(nearest[0]._id);
          setMasjid(fullMasjid);

          /* 3️⃣ Fetch masjid prayer timings */
          publicAPI
            .getPrayerTimings(fullMasjid._id)
            .then((res) => setMasjidTimings(res?.data || null))
            .catch(() => setMasjidTimings(null));

          /* 4️⃣ Fetch general timings (city + area + date) */
          publicAPI
            .getGeneralTimings({
              cityId: fullMasjid.city?._id,
              areaId: fullMasjid.area?._id,
              date: today,
            })
            .then((res) =>
              setGeneralTimings(
                res?.success ? normalizeGeneralTimings(res.data) : []
              )
            )

            .catch(() => setGeneralTimings(null));
        } catch (err) {
          console.error(err);
          setError("Failed to load nearest masjid.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Please allow location access.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  if (loading) {
    return (
      <section className="px-4 py-12 flex justify-center">
        <MasjidCardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-20 text-center text-white">
        <p className="mb-2">{error}</p>
        <p className="text-sm opacity-80">
          Enable location access or search manually.
        </p>
      </section>
    );
  }

  return (
    <section className="px-4 py-10">
      <MasjidDetailsLayout
        masjid={masjid}
        masjidTimings={masjidTimings}
        generalTimings={generalTimings}
      />
    </section>
  );
}
