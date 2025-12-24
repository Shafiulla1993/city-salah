// src/app/masjid/feed/page.js

import MasjidFeedClient from "./MasjidFeedClient";

export const metadata = {
  title: "Latest Masjids | CitySalah",
  description: "Recently added masjids with prayer timings and details",
};

export default function MasjidFeedPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Recently Added Masjids
      </h1>

      <MasjidFeedClient />
    </main>
  );
}
