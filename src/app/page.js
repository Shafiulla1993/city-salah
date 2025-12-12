// src/app/page/ClientHome.js
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";

import MasjidGrid from "@/components/masjid/MasjidGrid";
import MasjidSearchBar from "@/components/search/MasjidSearchBar";
import LocationSheet from "@/components/location/LocationSheet";
import LocationBar from "@/components/location/LocationBar";

import { publicAPI } from "@/lib/api/public";
import { useMasjidStore } from "@/store/useMasjidStore";
import { sortMasjidsByNext } from "@/utils/prayerSorting";
import { getPrevAndNextIqaamats } from "@/hooks/usePrayerCountdown";

export default function ClientHome() {
  const {
    selectedCity,
    selectedArea,
    selectedMasjid,
    setCity,
    setArea,
    setMasjid,
    init,
    loadingLocation,
  } = useMasjidStore();

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    init();
    return () => (mountedRef.current = false);
  }, [init]);

  // Local UI / data state
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [loadingMasjids, setLoadingMasjids] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchContainerRef = useRef(null);

  const showToast = useCallback((type, msg) => {
    if (type === "error") toast.error(msg);
    else if (type === "success") toast.success(msg);
    else toast.info(msg);
  }, []);

  /* --------------------------
     Compute Next Prayer (copied from your old code)
  ---------------------------*/
  const computeNextPrayer = (m) => {
    const timings = m.prayerTimings?.[0] || m.prayerTimings || {};
    const { next } = getPrevAndNextIqaamats(timings);
    return next || null;
  };

  const prepareMasjidList = useCallback((list = []) => {
    const mapped = list.map((m) => {
      const next = computeNextPrayer(m);
      return {
        _id: m._id,
        name: m.name,
        area: m.area || {},
        city: m.city || {},
        imageUrl: m.imageUrl || m.image || "/Default_Image.png",
        address: m.address || "",
        prayerTimings: m.prayerTimings || [],
        nextPrayer: next,
        fullDetails: null,
        fullDetailsLoading: false,
      };
    });

    // sort by nextPrayer (old style)
    mapped.sort((a, b) => {
      if (!a.nextPrayer && !b.nextPrayer) return 0;
      if (!a.nextPrayer) return 1;
      if (!b.nextPrayer) return -1;
      return a.nextPrayer.timeStr.localeCompare(b.nextPrayer.timeStr);
    });

    // keep old behavior (slice) if desired — here we keep entire list (you can slice if needed)
    return mapped;
  }, []);

  /* --------------------------
     Load cities
  ---------------------------*/
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await publicAPI.getCities();
        if (!cancelled && mountedRef.current) setCities(c || []);
      } catch {
        if (!cancelled) showToast("error", "Failed to load cities");
      }
    })();
    return () => (cancelled = true);
  }, [showToast]);

  /* --------------------------
     Load areas when city changes
  ---------------------------*/
  useEffect(() => {
    if (!selectedCity) return setAreas([]);
    let cancelled = false;
    (async () => {
      try {
        const res = await publicAPI.getAreas(selectedCity);
        if (!cancelled && mountedRef.current) setAreas(res || []);
      } catch {
        if (!cancelled) showToast("error", "Failed to load areas");
      }
    })();
    return () => (cancelled = true);
  }, [selectedCity, showToast]);

  /* --------------------------
     Load masjids by area (ONLY area)
  ---------------------------*/
  const loadMasjidsByArea = useCallback(
    async (areaId) => {
      if (!areaId) {
        setMasjids([]);
        return;
      }

      setLoadingMasjids(true);
      try {
        const list = await publicAPI.getMasjids({ areaId });
        if (!mountedRef.current) return;
        const prepared = prepareMasjidList(list || []);
        setMasjids(prepared);
      } catch (e) {
        console.error(e);
        showToast("error", "Failed to load masjids for area");
      } finally {
        if (mountedRef.current) setLoadingMasjids(false);
      }
    },
    [prepareMasjidList, showToast]
  );

  useEffect(() => {
    if (!selectedArea) return;
    loadMasjidsByArea(selectedArea);
  }, [selectedArea, loadMasjidsByArea]);

  /* --------------------------
     ensureSearchIndex (uses your old working approach)
     Important: this uses publicAPI.getMasjids({ search: "" })
     which mirrors your old working mechanism (avoids cross-city mixing).
  ---------------------------*/
  const ensureSearchIndex = useCallback(async () => {
    if (searchIndex !== null) return;
    try {
      // your old working code used getMasjids({ search: "" })
      const raw = await publicAPI.getMasjids({ search: "" });

      const idx = (raw || []).map((m) => ({
        _id: m._id,
        name: m.name,
        areaId: m.area?._id || "",
        areaName: m.area?.name || "",
        cityId: m.city?._id || "",
        cityName: m.city?.name || "",
      }));

      if (mountedRef.current) setSearchIndex(idx);
    } catch (err) {
      console.error("search index load failed", err);
      if (mountedRef.current) setSearchIndex([]);
    }
  }, [searchIndex]);

  /* --------------------------
     Search results (local filter)
  ---------------------------*/
  const filteredSearchResults =
    searchQuery && searchIndex
      ? searchIndex.filter((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  /* --------------------------
     Search selection behavior (S2: move to top & keep structure)
     Recreates your old onSelectFromSheet behavior but without prepareSingle()
  ---------------------------*/
  const onSelectFromSearch = async (m) => {
    if (!m || !m._id) return;

    // 1) Close search UI
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchOpen(false);

    // 2) If masjid belongs to different area -> set area & load that area's masjids
    if (m.areaId && m.areaId !== selectedArea) {
      // set area first (this also indicates a manual selection)
      setArea(m.areaId);
      // also set city if present
      if (m.cityId) setCity(m.cityId);

      // load that area's masjids (ensures we only have same-area masjids)
      await loadMasjidsByArea(m.areaId);
    } else {
      // same area: ensure city is set too (defensive)
      if (m.cityId && m.cityId !== selectedCity) setCity(m.cityId);
    }

    // 3) Now reorder current masjids: move selected to top, keep structure (S2)
    setMasjids((prev) => {
      // find selected in current list (match by _id)
      const foundIdx = prev.findIndex((x) => x._id === m._id);

      // if found in current list -> move to top
      if (foundIdx !== -1) {
        const copy = [...prev];
        const [sel] = copy.splice(foundIdx, 1);
        return [sel, ...copy];
      }

      // if not found (rare), add the minimal searched object at top
      const minimal = {
        _id: m._id,
        name: m.name,
        area: { _id: m.areaId, name: m.areaName },
        city: { _id: m.cityId, name: m.cityName },
        imageUrl: "/Default_Image.png",
        address: "",
        prayerTimings: [],
        nextPrayer: null,
        fullDetails: null,
        fullDetailsLoading: false,
      };
      return [minimal, ...(prev || [])];
    });

    // 4) Update global selected masjid (store). Keep the same object shape as earlier (without fullDetails).
    setMasjid({
      _id: m._id,
      name: m.name,
      area: { _id: m.areaId, name: m.areaName },
      city: { _id: m.cityId, name: m.cityName },
    });
  };

  /* --------------------------
     Make the search icon open search and autofocus the search input
     We use a DOM query to focus the MasjidSearchBar's internal input.
  ---------------------------*/
  useEffect(() => {
    if (!searchOpen) return;
    // ensure search index ready
    ensureSearchIndex();

    // show results container
    setShowSearchResults(true);

    // wait a tick then focus the input inside MasjidSearchBar
    const id = setTimeout(() => {
      const el = document.querySelector('input[placeholder="Search masjid…"]');
      try {
        el?.focus();
      } catch (e) {}
    }, 60);

    return () => clearTimeout(id);
  }, [searchOpen, ensureSearchIndex]);

  /* --------------------------
     UI
  ---------------------------*/
  const SEOBlock = (
    <h1 className="sr-only">
      CitySalah — Prayer timings, masjids, iqaamat, azaan, Islamic centres.
    </h1>
  );

  return (
    <div className="min-h-screen w-full">
      {SEOBlock}

      <div
        className="w-full mx-auto px-4 py-4 space-y-4 
     max-w-full 
     sm:max-w-full 
     lg:max-w-[1600px] 
"
      >
        {/* TOP BAR */}
        <div className="flex items-center gap-3">
          {/* SEARCH ICON */}
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 shadow-sm"
            aria-label="Open search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-slate-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
              />
            </svg>
          </button>

          {/* LOCATION PILL */}
          <div className="flex-1">
            <LocationBar
              cityName={cities.find((c) => c._id === selectedCity)?.name || ""}
              areaName={areas.find((a) => a._id === selectedArea)?.name || ""}
              onOpen={() => setSheetOpen(true)}
            />
          </div>
        </div>

        {/* INLINE SEARCH (dropdown-style) */}
        {searchOpen && (
          <div ref={searchContainerRef}>
            <MasjidSearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                ensureSearchIndex();
                setShowSearchResults(true);
              }}
              onFocus={() => {
                ensureSearchIndex();
                setShowSearchResults(true);
              }}
              results={filteredSearchResults}
              showResults={showSearchResults}
              onSelect={(m) => {
                // m is from searchIndex (contains areaId, cityId, etc.)
                onSelectFromSearchWrapper(m); // wrapper defined below
              }}
            />
          </div>
        )}

        {/* MASJID GRID / CAROUSEL */}
        <div className="mt-4">
          {loadingMasjids || loadingLocation ? (
            <div className="text-center text-slate-500 py-20">Loading…</div>
          ) : masjids.length ? (
            <MasjidGrid
              masjids={masjids}
              onExpand={async (m) => {
                // load full details and set in store (old behavior)
                try {
                  const full = await publicAPI.getMasjidById(m._id);
                  setMasjid(full);
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          ) : (
            <div className="text-center py-20 text-slate-600">
              No masjids found. Select city/area.
            </div>
          )}
        </div>
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
        setSelectedArea={(aId) => {
          setArea(aId);
        }}
        onSelectMasjid={(m) => {
          // If user picks masjid from location sheet, reuse same behavior:
          onSelectFromSearchWrapper(m);
        }}
      />
    </div>
  );

  /* --------------------------
     Local wrapper to reuse old onSelectFromSheet logic but adapted
     to S2 (no prepareSingle) and A3 (move searched masjid to top)
  ---------------------------*/
  async function onSelectFromSearchWrapper(m) {
    // m likely comes from searchIndex mapping with areaId, cityId
    if (!m || !m._id) return;

    // close UI
    setSearchOpen(false);
    setSearchQuery("");
    setShowSearchResults(false);

    // If area differs, set area & city and load that area's masjids
    if (m.areaId && m.areaId !== selectedArea) {
      setArea(m.areaId);
      if (m.cityId) setCity(m.cityId);

      // load area masjids (this ensures only masjids in that area appear)
      await loadMasjidsByArea(m.areaId);
    } else {
      // ensure city is set too if needed
      if (m.cityId && m.cityId !== selectedCity) setCity(m.cityId);
    }

    // Reorder: put searched masjid to top (A3) but keep structure (S2)
    setMasjids((prev) => {
      const idx = prev.findIndex((x) => x._id === m._id);
      if (idx !== -1) {
        const copy = [...prev];
        const [sel] = copy.splice(idx, 1);
        return [sel, ...copy];
      } else {
        // if absent, insert minimal object at top
        const minimal = {
          _id: m._id,
          name: m.name,
          area: { _id: m.areaId, name: m.areaName },
          city: { _id: m.cityId, name: m.cityName },
          imageUrl: "/Default_Image.png",
          address: "",
          prayerTimings: [],
          nextPrayer: null,
          fullDetails: null,
          fullDetailsLoading: false,
        };
        return [minimal, ...(prev || [])];
      }
    });

    // Update global selected masjid in store (minimal shape)
    setMasjid({
      _id: m._id,
      name: m.name,
      area: { _id: m.areaId, name: m.areaName },
      city: { _id: m.cityId, name: m.cityName },
    });
  }
}
