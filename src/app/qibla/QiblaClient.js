// src/app/qibla/QiblaClient.js

"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import { getQiblaBearing } from "@/lib/qibla/getQiblaBearing";

import QiblaCompass from "@/components/qibla/QiblaCompass";
import QiblaSkeleton from "@/components/qibla/QiblaSkeleton";

/**
 * Distance to Kaaba (approx, km)
 */
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
 * mode:
 * - "live" → GPS + compass
 * - "city" → fixed coordinates + compass
 */
export default function QiblaClient({ mode = "live", initialLat, initialLng }) {
  const isCityMode = mode === "city";

  const { location, error } = useGeolocation({
    enabled: !isCityMode,
  });

  const heading = useCompassHeading();

  const lat = isCityMode ? initialLat : location?.lat;
  const lng = isCityMode ? initialLng : location?.lng;

  // Location permission error (live mode only)
  if (!isCityMode && error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 text-center text-white/70">
        Location access is required to determine the Qibla direction.
      </div>
    );
  }

  const hasData = lat && lng && heading !== null;

  const qiblaBearing = hasData ? getQiblaBearing(lat, lng) : null;

  const rotation =
    hasData && qiblaBearing !== null
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
      {/* FIXED HEIGHT SLOT (prevents layout jump) */}
      <div className="mt-4 flex items-center justify-center h-[320px] w-full">
        {!hasData ? (
          <QiblaSkeleton />
        ) : (
          <QiblaCompass
            heading={heading}
            qiblaBearing={qiblaBearing}
            distanceKm={distanceKm(lat, lng)}
          />
        )}
      </div>

      {/* ROTATION INSTRUCTION */}
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

      {/* ACCURACY & METHOD */}
      <div className="mt-6 max-w-md text-sm text-white/60 text-center leading-relaxed">
        <p>
          The Qibla direction is calculated using your device’s location and
          orientation sensors together with the geographic bearing toward the
          Kaaba in Makkah.
        </p>

        <p className="mt-2">
          Accuracy may vary due to device calibration or nearby magnetic
          interference. This direction should be treated as an estimate.
        </p>

        <p className="mt-2 text-xs text-white/50">
          For complete certainty, please verify with a local mosque or a
          physical compass.
        </p>
      </div>
    </section>
  );
}
