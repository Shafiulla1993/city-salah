// src/app/qibla/[cityslug]/QiblaCityClient.js

"use client";

import { useQibla } from "@/hooks/useQibla";
import QiblaCompass from "@/components/qibla/QiblaCompass";

export default function QiblaCityClient({ city }) {
  const { bearing, heading } = useQibla({
    fallbackLocation: {
      lat: city.latitude,
      lng: city.longitude,
    },
  });

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-white">
      <h1 className="text-xl font-semibold mb-4">
        Qibla Direction in {city.name}
      </h1>

      <QiblaCompass bearing={bearing} heading={heading} />
    </section>
  );
}
