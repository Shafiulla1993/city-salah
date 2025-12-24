// src/app/nearest-masjid/NearestMasjidClient.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import MasjidDetailsLayout from "@/components/masjid/MasjidDetailsLayout";
import { MasjidCardSkeleton } from "@/components/masjid/loaders";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";

/**
 * Error codes:
 * - GPS_UNSUPPORTED
 * - GPS_DENIED
 * - NO_NEARBY_MASJID
 * - FETCH_FAILED
 */

export default function NearestMasjidClient() {
  const [loading, setLoading] = useState(true);
  const [masjid, setMasjid] = useState(null);
  const [masjidTimings, setMasjidTimings] = useState(null);
  const [generalTimings, setGeneralTimings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS_UNSUPPORTED");
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

          if (!nearest || nearest.length === 0) {
            setError("NO_NEARBY_MASJID");
            return;
          }

          /* 2️⃣ Fetch full masjid */
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
          setError("FETCH_FAILED");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("GPS_DENIED");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  /* -----------------------------
     LOADING STATE
  ------------------------------ */
  if (loading) {
    return (
      <section className="px-4 py-12 flex justify-center">
        <MasjidCardSkeleton />
      </section>
    );
  }

  /* -----------------------------
     ERROR STATES (HUMAN UX)
  ------------------------------ */
  if (error) {
    const messageMap = {
      GPS_UNSUPPORTED: {
        title: "Location not supported",
        desc: "Your device does not support location services. You can still search masjids manually.",
      },
      GPS_DENIED: {
        title: "Location access denied",
        desc: "You can search masjids by city or area without enabling location.",
      },
      NO_NEARBY_MASJID: {
        title: "No nearby masjid found",
        desc: "We’re actively expanding our masjid database. You can search masjids manually for now.",
      },
      FETCH_FAILED: {
        title: "Unable to load nearby masjid",
        desc: "Something went wrong while finding nearby masjids. Please try manual search.",
      },
    };

    const msg = messageMap[error];

    return (
      <section className="px-4 py-20 text-center text-white max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2">{msg.title}</h2>
        <p className="text-sm opacity-80 mb-6">{msg.desc}</p>

        <a
          href="/masjids"
          className="inline-block px-6 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold shadow"
        >
          Search Masjids
        </a>
      </section>
    );
  }

  /* -----------------------------
     SUCCESS STATE
  ------------------------------ */
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
