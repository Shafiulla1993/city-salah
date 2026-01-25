// src/app/qibla/QiblaCompassClient.js

// src/app/qibla/QiblaCompassClient.js
"use client";

import { useEffect } from "react";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import { getQiblaBearing } from "@/lib/qibla/getQiblaBearing";
import QiblaCompass from "@/components/qibla/QiblaCompass";
import QiblaSkeleton from "@/components/qibla/QiblaSkeleton";
import { useMasjidStore } from "@/store/useMasjidStore";

/* Distance to Kaaba (km) */
function distanceKm(lat1, lng1) {
  const R = 6371;
  const dLat = ((21.422487 - lat1) * Math.PI) / 180;
  const dLng = ((39.826206 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((21.422487 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export default function QiblaCompassClient({
  initialLat,
  initialLng,
  autoDetect,
}) {
  const heading = useCompassHeading();
  const { coords, detectMyCoordsOnly, loadingLocation } = useMasjidStore();

  // 🔁 GPS auto-detect only for /qibla root
  useEffect(() => {
    if (autoDetect) {
      detectMyCoordsOnly(); // always re-request GPS on /qibla
    }
  }, [autoDetect, null, detectMyCoordsOnly]);

  const lat = coords?.lat || initialLat;
  const lng = coords?.lng || initialLng;

  const hasData = lat && lng;
  const qiblaBearing = hasData ? getQiblaBearing(lat, lng) : null;

  const rotation =
    heading !== null && qiblaBearing !== null
      ? ((heading - qiblaBearing + 540) % 360) - 180
      : null;

  const degreesLeft = rotation !== null ? Math.abs(rotation).toFixed(0) : null;

  const rotateText =
    rotation > 0
      ? `Rotate ${degreesLeft}° to the right`
      : rotation < 0
        ? `Rotate ${degreesLeft}° to the left`
        : "You are aligned with the Qibla";

  return (
    <section className="flex flex-col items-center px-4 pb-10">
      <div className="mt-4 flex items-center justify-center h-[320px] w-full">
        {!hasData || loadingLocation ? (
          <QiblaSkeleton />
        ) : (
          <QiblaCompass
            heading={heading}
            qiblaBearing={qiblaBearing}
            distanceKm={distanceKm(lat, lng)}
          />
        )}
      </div>

      {rotation !== null && (
        <>
          <p className="mt-4 text-base font-semibold text-white text-center">
            {rotateText}
          </p>

          <p className="mt-1 text-sm text-white/70 text-center">
            Keep your phone flat and rotate slowly
          </p>
        </>
      )}
    </section>
  );
}
