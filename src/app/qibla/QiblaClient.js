// src/app/qibla/QiblaClient.js

"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import { getQiblaBearing } from "@/lib/qibla/getQiblaBearing";

import QiblaCompass from "@/components/qibla/QiblaCompass";
import QiblaSkeleton from "@/components/qibla/QiblaSkeleton";

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

/**
 * QiblaClient
 *
 * mode:
 * - "live" → GPS + compass (default)
 * - "city" → fixed coords + compass
 */
export default function QiblaClient({ mode = "live", initialLat, initialLng }) {
  const isCityMode = mode === "city";

  const { location, error } = useGeolocation({
    enabled: !isCityMode,
  });

  const heading = useCompassHeading();

  const lat = isCityMode ? initialLat : location?.lat;
  const lng = isCityMode ? initialLng : location?.lng;

  if (!isCityMode && error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 px-4 text-center">
        Location access is required to find Qibla direction.
      </div>
    );
  }

  if (!lat || !lng || heading === null) {
    return <QiblaSkeleton />;
  }

  const qiblaBearing = getQiblaBearing(lat, lng);

  const rotation = ((heading - qiblaBearing + 540) % 360) - 180;

  const degreesLeft = Math.abs(rotation).toFixed(0);
  const rotateText =
    rotation > 0
      ? `Rotate ${degreesLeft}° right`
      : rotation < 0
      ? `Rotate ${degreesLeft}° left`
      : "Aligned";

  return (
    <main className="min-h-screen flex flex-col items-center pt-6 pb-24">
      {/* Compass */}
      <div className="mt-6">
        <QiblaCompass
          heading={heading}
          qiblaBearing={qiblaBearing}
          distanceKm={distanceKm(lat, lng)}
        />
      </div>

      {/* Instructions */}
      <div className="fixed bottom-16 left-0 right-0 text-center px-4">
        <p className="text-lg font-semibold text-gray-900">{rotateText}</p>

        <p className="mt-1 text-sm text-gray-600">
          Keep your phone flat and rotate slowly
        </p>

        <p className="mt-2 text-xs text-gray-500">
          Qibla bearing from this location:{" "}
          <span className="font-medium text-gray-700">
            {qiblaBearing.toFixed(1)}°
          </span>
        </p>

        <p className="mt-1 text-[11px] text-gray-400 leading-snug">
          Direction shown is an estimate based on device sensors. For best
          accuracy, verify with a local mosque or physical compass.
        </p>
      </div>
    </main>
  );
}
