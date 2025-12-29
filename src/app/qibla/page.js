// src/app/qibla/page.js

import QiblaClient from "./QiblaClient";

export const metadata = {
  title: "Qibla Direction Finder | Find Qibla from Anywhere | CitySalah",
  description:
    "Find the Qibla direction from anywhere in the world using your device location and compass. CitySalah helps you locate the direction of the Kaaba in Makkah.",
};

export default function QiblaPage() {
  return (
    <main className="flex flex-col">
      {/* SEO CONTENT */}
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-2 text-center">
        <h1 className="text-xl font-semibold text-white">
          Qibla Direction Finder
        </h1>

        <p className="mt-2 text-sm text-white/80">
          Find the direction of the Kaaba in Makkah from anywhere in the world
          using your device’s location and compass sensors.
        </p>
      </section>

      <QiblaClient />
    </main>
  );
}
