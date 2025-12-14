// src/app/page.js

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";

import MasjidGrid from "@/components/masjid/MasjidGrid";
import MasjidSearchBar from "@/components/search/MasjidSearchBar";
import LocationSheet from "@/components/location/LocationSheet";
import LocationBar from "@/components/location/LocationBar";

import { publicAPI } from "@/lib/api/public";
import { useMasjidStore } from "@/store/useMasjidStore";
import { getPrevAndNextIqaamats } from "@/hooks/usePrayerCountdown";
import { searchItems } from "@/lib/search/searchCore";
import { SEARCH_PRESETS } from "@/lib/search/searchPresets";
import {
  LocationBarSkeleton,
  MasjidCardSkeleton,
} from "@/components/masjid/loaders";

/* ---------------- HELPERS ---------------- */
const computeNextPrayer = (m) => {
  const timings = m.prayerTimings?.[0] || m.prayerTimings || {};
  return getPrevAndNextIqaamats(timings).next || null;
};

const normalizeMasjid = (m) => ({
  _id: m._id,
  name: m.name,
  area: m.area,
  city: m.city,
  imageUrl: m.imageUrl || "/Default_Image.png",
  address: m.address || "",
  prayerTimings: m.prayerTimings || [],
  nextPrayer: computeNextPrayer(m),
  fullDetails: m,
  fullDetailsLoading: false,
});

export default function Page() {
  const {
    selectedCity,
    selectedArea,
    selectedMasjid,
    gpsDetected,
    setCity,
    setArea,
    setMasjid,
    init,
    loadingLocation,
  } = useMasjidStore();

  const mounted = useRef(true);

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [loadingMasjids, setLoadingMasjids] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    mounted.current = true;
    init();
    return () => (mounted.current = false);
  }, [init]);

  /* ---------------- LOAD CITIES ---------------- */
  useEffect(() => {
    publicAPI
      .getCities()
      .then(setCities)
      .catch(() => {
        toast.error("Failed to load cities");
      });
  }, []);

  /* ---------------- LOAD AREAS ---------------- */
  useEffect(() => {
    if (!selectedCity) return setAreas([]);
    publicAPI.getAreas(selectedCity).then(setAreas);
  }, [selectedCity]);

  /* ---------------- LOAD MASJIDS BY AREA (AREA MODE ONLY) ---------------- */
  const loadMasjidsByArea = useCallback(async (areaId) => {
    setLoadingMasjids(true);
    try {
      const list = await publicAPI.getMasjids({ areaId });
      if (!mounted.current) return;
      setMasjids(list.map(normalizeMasjid));
    } catch {
      toast.error("Failed to load masjids");
    } finally {
      setLoadingMasjids(false);
    }
  }, []);

  useEffect(() => {
    // 🔒 SINGLE MASJID MODE → BLOCK AREA LOAD
    if (selectedMasjid && !gpsDetected) {
      // 🔒 true single-masjid mode
      setMasjids([normalizeMasjid(selectedMasjid)]);
      return;
    }

    if (selectedArea) {
      loadMasjidsByArea(selectedArea);
    }
  }, [selectedArea, selectedMasjid, loadMasjidsByArea]);

  /* ---------------- SEARCH INDEX ---------------- */
  const ensureSearchIndex = useCallback(async () => {
    if (Array.isArray(searchIndex)) return;
    try {
      const idx = await publicAPI.getAllMasjidIndex();
      setSearchIndex(idx || []);
    } catch {
      setSearchIndex([]);
    }
  }, [searchIndex]);

  const filteredSearchResults = searchItems({
    data: searchIndex || [],
    query: searchQuery,
    fields: SEARCH_PRESETS.MASJID_PUBLIC,
  });

  /* ---------------- SEARCH BAR (AREA MODE) ---------------- */
  const onSelectFromSearchBar = async (m) => {
    setSearchOpen(false);
    setSearchQuery("");
    setShowSearchResults(false);

    if (m.cityId) setCity(m.cityId);
    if (m.areaId) {
      setArea(m.areaId);
      await loadMasjidsByArea(m.areaId);
    }
  };

  /* ---------------- LOCATION SHEET (SINGLE MODE) ---------------- */
  const onSelectFromLocationSheet = async (m) => {
    setSheetOpen(false);
    try {
      const full = await publicAPI.getMasjidByIdentifier(m.slug, m.areaId);
      setMasjid(full);
      setMasjids([normalizeMasjid(full)]);
    } catch {
      toast.error("Failed to load masjid");
    }
  };

  useEffect(() => {
    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, []);

  const originalTitleRef = useRef(null);

  const handleFlipChange = useCallback((flipped, masjid) => {
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    if (flipped && masjid) {
      const city = masjid.city?.name || "";
      const area = masjid.area?.name || "";

      document.title = `${masjid.name} – ${area}, ${city} | CitySalah`;
    } else {
      document.title = originalTitleRef.current;
    }
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-screen bg-gradient-to-r from-neutral-200 to-neutral-400">
      <h1 className="sr-only">CitySalah — Prayer Timings & Masjids</h1>

      {/* TOP BAR */}
      <div className="flex justify-center pt-4">
        <div className="flex items-center gap-2">
          {loadingLocation || loadingMasjids ? (
            <LocationBarSkeleton />
          ) : (
            <LocationBar
              cityName={cities.find((c) => c._id === selectedCity)?.name || ""}
              areaName={areas.find((a) => a._id === selectedArea)?.name || ""}
              onOpen={() => {
                ensureSearchIndex();
                setSheetOpen(true);
              }}
            />
          )}

          {/* SEARCH */}
          <div className="relative">
            <button
              onClick={() => {
                ensureSearchIndex();
                setSearchOpen((s) => !s);
              }}
              className="p-2.5 rounded-full bg-slate-100"
            >
              🔍
            </button>

            {searchOpen && (
              <div className="absolute right-0 mt-2 w-[320px] z-50">
                <MasjidSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  results={filteredSearchResults}
                  showResults={showSearchResults}
                  onFocus={() => setShowSearchResults(true)}
                  onSelect={onSelectFromSearchBar}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="mt-6 px-4">
        {loadingMasjids || loadingLocation ? (
          <div className="flex gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <MasjidCardSkeleton key={i} />
            ))}
          </div>
        ) : masjids.length ? (
          <MasjidGrid masjids={masjids} onFlipChange={handleFlipChange} />
        ) : (
          <div className="text-center py-20 text-slate-600">
            Select city and area
          </div>
        )}
      </div>

      {/* LOCATION SHEET */}
      <LocationSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        cities={cities}
        areas={areas}
        searchIndex={searchIndex || []}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        setSelectedCity={setCity}
        setSelectedArea={setArea}
        onSelectMasjid={onSelectFromLocationSheet}
      />
    </div>
  );
}
