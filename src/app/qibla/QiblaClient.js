// src/app/qibla/QiblaClient.js

"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import { getQiblaBearing } from "@/lib/qibla/getQiblaBearing";
import QiblaCompass from "@/components/qibla/QiblaCompass";

export default function QiblaClient() {
  const { location, error } = useGeolocation();
  const heading = useCompassHeading();

  if (error) return <p>Location required</p>;
  if (!location) return <p>Getting location…</p>;

  const qibla = getQiblaBearing(
    location.lat,
    location.lng
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="mb-6">Qibla Direction</h1>
      <QiblaCompass heading={heading} qibla={qibla} />
      <p className="mt-4 text-white/70 text-sm">
        Rotate phone until arrow points to Kaaba
      </p>
    </main>
  );
}
