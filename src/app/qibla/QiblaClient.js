// src/app/qibla/QiblaClient.js

"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import { calculateQiblaDirection } from "@/lib/qibla/calculateQibla";
import QiblaLiveCompass from "@/components/qibla/QiblaLiveCompass";

export default function QiblaClient() {
  const { location, error } = useGeolocation();
  const heading = useCompassHeading();

  if (error) {
    return <p className="text-white">Location access required</p>;
  }

  if (!location) {
    return <p className="text-white">Getting location…</p>;
  }

  const qibla = calculateQiblaDirection(location.lat, location.lng);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="mb-6 text-lg font-semibold">Qibla Direction</h1>

      <QiblaLiveCompass heading={heading} qibla={qibla} />

      <p className="mt-6 text-sm text-white/70">
        Rotate your phone until the Kaaba reaches the top
      </p>
    </main>
  );
}
