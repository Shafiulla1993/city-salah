// src/app/masjid/MasjidSearchClient.js
"use client";

import { useEffect, useState } from "react";
import LocationBar from "@/components/location/LocationBar";
import LocationSheet from "@/components/location/LocationSheet";
import MasjidCardLite from "@/components/masjid/MasjidCardLite";
import { useMasjidFeed } from "@/hooks/useMasjidFeed";

export default function MasjidSearchClient() {
  const [open, setOpen] = useState(false);

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [searchIndex, setSearchIndex] = useState([]);

  const [selectedCity, setSelectedCity] = useState(undefined);
  const [selectedArea, setSelectedArea] = useState(undefined);

  /* ---------------------------
     Load cities (once)
  ---------------------------- */
  useEffect(() => {
    fetch("/api/public/cities")
      .then((r) => r.json())
      .then(setCities)
      .catch(console.error);
  }, []);

  /* ---------------------------
     Load areas when city changes
  ---------------------------- */
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      return;
    }

    fetch(`/api/public/areas?cityId=${selectedCity}`)
      .then((r) => r.json())
      .then(setAreas)
      .catch(console.error);
  }, [selectedCity]);

  /* ---------------------------
     Load search index (lightweight)
  ---------------------------- */
  useEffect(() => {
    fetch("/api/public/masjids?mode=index")
      .then((r) => r.json())
      .then(setSearchIndex)
      .catch(console.error);
  }, []);

  /* ---------------------------
     Infinite feed (Unified API)
  ---------------------------- */
  const { masjids, loading, hasMore, setObserver, loadNext } = useMasjidFeed({
    limit: 12,
    cityId: selectedCity,
    areaId: selectedArea,
  });

  return (
    <>
      <LocationBar
        cityName={cities.find((c) => c._id === selectedCity)?.name}
        areaName={areas.find((a) => a._id === selectedArea)?.name}
        onOpen={() => setOpen(true)}
      />

      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {masjids.map((m) => (
          <MasjidCardLite key={m._id} masjid={m} />
        ))}

        {hasMore && (
          <div className="col-span-full flex justify-center mt-6">
            <button
              onClick={loadNext}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white shadow-md disabled:opacity-60 active:scale-95"
            >
              {loading ? "Loading…" : "Load more masjids"}
            </button>
          </div>
        )}

        {hasMore && <div ref={setObserver} className="col-span-full h-px" />}
      </section>

      <LocationSheet
        open={open}
        onClose={() => setOpen(false)}
        cities={cities}
        areas={areas}
        searchIndex={searchIndex}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        setSelectedCity={(id) => {
          setSelectedCity(id);
          setSelectedArea(undefined);
        }}
        setSelectedArea={setSelectedArea}
        onSelectMasjid={(m) => {
          window.location.href = `/${m.citySlug}/${m.areaSlug}/masjid/${m.slug}`;
        }}
      />
    </>
  );
}
