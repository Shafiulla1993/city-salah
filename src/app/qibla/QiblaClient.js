// src/app/qibla/QiblaClient.js

"use client";

import { useState } from "react";
import { useQibla } from "@/hooks/useQibla";
import QiblaCompass from "@/components/qibla/QiblaCompass";
import QiblaCityPicker from "@/components/qibla/QiblaCityPicker";

export default function QiblaClient() {
  const [fallbackLocation, setFallbackLocation] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const { bearing, heading } = useQibla({ fallbackLocation });

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-white">
      <h1 className="text-xl font-semibold mb-4">Qibla Finder</h1>

      {bearing === null && (
        <button
          onClick={() => setShowPicker(true)}
          className="text-sm text-emerald-400 underline"
        >
          Choose city manually
        </button>
      )}

      <QiblaCompass bearing={bearing} heading={heading} />

      {showPicker && (
        <QiblaCityPicker
          onSelect={(city) => {
            setFallbackLocation({
              lat: city.latitude,
              lng: city.longitude,
            });
            setShowPicker(false);
          }}
        />
      )}
    </section>
  );
}
