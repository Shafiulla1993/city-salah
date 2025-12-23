// src/app/nearest-masjid/page.js

export const metadata = {
  title: "Nearest Masjid Near You | CitySalah",
  description:
    "Find the nearest masjid near you with accurate prayer timings and auqatus salah based on your area.",
};

import NearestMasjidClient from "./NearestMasjidClient";

export default function NearestMasjidPage() {
  return (
    <main
      className="min-h-screen bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('/hero-bg.webp')" }}
    >
      <div className="min-h-screen bg-black/30">
        <h1 className="sr-only">Nearest Masjid Near You</h1>
        <NearestMasjidClient />
      </div>
    </main>
  );
}
