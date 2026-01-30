// src/app/[citySlug]/auqatus-salah/AuqatusCityClient.js

"use client";

import { useEffect, useState } from "react";
import AuqatusCards from "@/components/auqatus/AuqatusCards";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";
import HijriHeader from "@/components/auqatus/HijriHeader";

export default function AuqatusCityClient({ citySlug }) {
  const [coords, setCoords] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hijri, setHijri] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setLoading(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;

    fetch(
      `/api/public/prayer-timings/by-coords?lat=${coords.lat}&lng=${coords.lng}`,
    )
      .then((r) => r.json())
      .then((d) => {
        const normalized = normalizeGeneralTimings({
          success: true,
          slots: d.slots,
        });
        setSlots(normalized);
        setHijri(d?.hijri || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [coords]);

  if (loading) return <div className="p-4 text-center">Loading timings…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <HijriHeader hijri={hijri} />
      <h1 className="text-xl font-bold mb-4">
        Auqatus Salah Timings – {citySlug.replace(/-/g, " ")}
      </h1>
      <AuqatusCards slots={slots} variant="full" />
    </div>
  );
}
