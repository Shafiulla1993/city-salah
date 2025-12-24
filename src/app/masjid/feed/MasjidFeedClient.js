// src/app/masjid/feed/MasjidFeedClient

"use client";

import MasjidCardLite from "@/components/masjid/MasjidCardLite";
import { useMasjidFeed } from "@/hooks/useMasjidFeed";

export default function MasjidFeedClient() {
  const { masjids, loading, hasMore, setObserver } = useMasjidFeed({
    limit: 10,
  });

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {masjids.map((m) => (
        <MasjidCardLite key={m._id} masjid={m} />
      ))}

      {hasMore && <div ref={setObserver} className="col-span-full h-12" />}

      {loading && (
        <p className="col-span-full text-center text-white/70 py-6">
          Loading more masjids…
        </p>
      )}
    </section>
  );
}
