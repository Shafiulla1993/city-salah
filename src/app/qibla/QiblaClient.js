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

export default function QiblaClient({ cityName, areaName }) {
  const { location, error } = useGeolocation({ enableHighAccuracy: true });
  const heading = useCompassHeading();

  const lat = location?.lat;
  const lng = location?.lng;

  const hasData = lat && lng && heading !== null;
  const qiblaBearing = hasData ? getQiblaBearing(lat, lng) : null;

  const rotation = hasData
    ? ((heading - qiblaBearing + 540) % 360) - 180
    : null;

  const distance = hasData ? distanceKm(lat, lng) : null;

  return (
    <section className="flex flex-col items-center px-4 pb-12">
      <div className="mt-4 h-[320px] flex items-center justify-center w-full">
        {!hasData ? (
          <QiblaSkeleton />
        ) : (
          <QiblaCompass
            heading={heading}
            qiblaBearing={qiblaBearing}
            distanceKm={distance}
          />
        )}
      </div>

      {rotation !== null && (
        <p className="mt-4 font-semibold text-white text-center">
          {rotation > 0
            ? `Rotate ${Math.abs(rotation).toFixed(0)}° to the right`
            : `Rotate ${Math.abs(rotation).toFixed(0)}° to the left`}
        </p>
      )}

      {/* SEO Content */}
      <div className="mt-8 max-w-xl text-sm text-white/70 text-center leading-relaxed">
        <h2 className="text-base font-semibold text-white mb-2">
          Qibla Direction in {areaName}, {cityName}
        </h2>

        <p>
          This compass shows the accurate Qibla (Kaaba) direction for people in{" "}
          {areaName}, {cityName} using your device’s GPS and orientation
          sensors.
        </p>

        {distance && (
          <p className="mt-2">
            The distance from {areaName} to the Holy Kaaba in Makkah is
            approximately <strong>{distance} km</strong>.
          </p>
        )}

        <p className="mt-2">
          Face this direction while offering Salah. For best accuracy, keep your
          phone flat and away from metal objects.
        </p>
      </div>
    </section>
  );
}
