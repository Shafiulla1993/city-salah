"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";

import MasjidCarousel from "@/components/carousel/MasjidCarousel";
import LocationBar from "@/components/location/LocationBar";
import LocationSheet from "@/components/location/LocationSheet";
import MasjidSearchBar from "@/components/search/MasjidSearchBar";

import { publicAPI } from "@/lib/api/public";
import { useAuth } from "@/context/AuthContext";

import {
  MasjidInfoLoader,
  PrayerTimingsLoader,
  ContactInfoLoader,
} from "@/components/masjid/loaders";

import { useMasjidStore } from "@/store/useMasjidStore";

/* ---------------------------------------------------------
      PAGE.JS — Final Version (Option A Slide-down)
--------------------------------------------------------- */

export default function ClientHome() {
  const { user } = useAuth();

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
  const carouselRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    init();
    return () => (mountedRef.current = false);
  }, [init]);

  /* -----------------------------------------
      Local States
  ------------------------------------------*/
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [loadingNearest, setLoadingNearest] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const showToast = useCallback((type, msg) => {
    if (type === "error") toast.error(msg);
    else if (type === "success") toast.success(msg);
    else toast.info(msg);
  }, []);

  /* -----------------------------------------
      Load Cities
  ------------------------------------------*/
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

  /* -----------------------------------------
      Load Areas (when city changes)
  ------------------------------------------*/
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

  /* -----------------------------------------
      Compute Next Prayer
  ------------------------------------------*/
  const computeNextPrayer = (m) => {
    const timings = m.prayerTimings?.[0];
    if (!timings) return null;

    const list = [
      { name: "Fajr", time: timings.fajr?.iqaamat },
      { name: "Zohar", time: timings.Zohar?.iqaamat },
      { name: "Asr", time: timings.asr?.iqaamat },
      { name: "Maghrib", time: timings.maghrib?.iqaamat },
      { name: "Isha", time: timings.isha?.iqaamat },
      { name: "Juma", time: timings.juma?.iqaamat },
    ];

    const toDate = (t) => {
      if (!t) return null;
      let [h, m2] = t.split(":").map(Number);
      const now = new Date();
      const d = new Date();
      d.setHours(h, m2, 0, 0);
      if (d < now) d.setDate(d.getDate() + 1);
      return d;
    };

    const up = list
      .map((p) => ({ ...p, date: toDate(p.time) }))
      .filter((p) => p.date)
      .sort((a, b) => a.date - b.date)[0];

    if (!up) return null;

    const hh = String(up.date.getHours()).padStart(2, "0");
    const mm = String(up.date.getMinutes()).padStart(2, "0");

    return { name: up.name, timeStr: `${hh}:${mm}` };
  };

  /* -----------------------------------------
      Prepare Masjid List
  ------------------------------------------*/
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

    mapped.sort((a, b) => {
      if (!a.nextPrayer && !b.nextPrayer) return 0;
      if (!a.nextPrayer) return 1;
      if (!b.nextPrayer) return -1;
      return a.nextPrayer.timeStr.localeCompare(b.nextPrayer.timeStr);
    });

    return mapped.slice(0, 8);
  }, []);

  /* -----------------------------------------
      Load Masjids by Area
  ------------------------------------------*/
  const loadMasjidsByArea = useCallback(
    async (areaId) => {
      if (!areaId) return;
      setLoadingMasjids(true);
      try {
        const list = await publicAPI.getMasjids({ areaId });
        if (!mountedRef.current) return;
        const prepared = prepareMasjidList(list || []);
        setMasjids(prepared);
      } catch {
        showToast("error", "Failed to load masjids for area");
      } finally {
        if (mountedRef.current) setLoadingMasjids(false);
      }
    },
    [prepareMasjidList, showToast]
  );

  /* -----------------------------------------
      GPS → Nearest Masjids
  ------------------------------------------*/
  const tryLoadNearest = useCallback(
    async (lat, lng) => {
      setLoadingNearest(true);
      try {
        const nearest = await publicAPI.getNearestMasjids({
          lat,
          lng,
          limit: 8,
        });
        if (!mountedRef.current) return false;
        if (nearest?.length) {
          const prepared = prepareMasjidList(nearest);
          setMasjids(prepared);

          if (nearest[0]?.area?._id) {
            setArea(nearest[0].area._id);
            if (nearest[0].area.city?._id) setCity(nearest[0].area.city._id);
          }
          return true;
        }
      } catch {
      } finally {
        if (mountedRef.current) setLoadingNearest(false);
      }
      return false;
    },
    [prepareMasjidList, setArea, setCity]
  );

  /* -----------------------------------------
      Initial Flow (GPS → user area → manual)
  ------------------------------------------*/
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) GPS
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej)
          );
          if (cancelled) return;
          const ok = await tryLoadNearest(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (ok) return;
        } catch {}
      }

      // 2) User's preferred area
      if (user && (user.area || user.masjidAreaId)) {
        const id = user.area || user.masjidAreaId;
        setArea(id);
        await loadMasjidsByArea(id);
        return;
      }

      // 3) Manual selector
      setSheetOpen(true);
    })();

    return () => (cancelled = true);
  }, [user, tryLoadNearest, loadMasjidsByArea, setArea]);

  /* -----------------------------------------
      Load Masjids when area changes
  ------------------------------------------*/
  useEffect(() => {
    if (!selectedArea) return;
    loadMasjidsByArea(selectedArea);
  }, [selectedArea, loadMasjidsByArea]);

  /* -----------------------------------------
      SEARCH — Load Small Index
  ------------------------------------------*/
  const ensureSearchIndex = useCallback(async () => {
    if (searchIndex) return;

    try {
      const raw = await publicAPI.getMasjids({ search: "" });

      const idx = (raw || []).map((m) => ({
        _id: m._id,
        name: m.name,
        areaId: m.area?._id || "",
        areaName: m.area?.name || "",
        cityName: m.city?.name || "",
      }));

      if (mountedRef.current) setSearchIndex(idx);
    } catch {
      setSearchIndex([]);
    }
  }, [searchIndex]);

  /* -----------------------------------------
      SEARCH RESULTS
  ------------------------------------------*/
  const searchResults =
    searchQuery && searchIndex
      ? searchIndex.filter((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  /* -----------------------------------------
      OPTION A — SEARCH SELECTION BEHAVIOR
      Selected masjid becomes #1, others follow
  ------------------------------------------*/

  const prepareSingle = (full) => {
    const next = computeNextPrayer(full);

    return [
      {
        _id: full._id,
        name: full.name,
        area: full.area || {},
        city: full.city || {},
        imageUrl: full.imageUrl || "/Default_Image.png",
        address: full.address || "",
        prayerTimings: full.prayerTimings || [],
        nextPrayer: next,
        fullDetails: {
          prayerTimings: (full.prayerTimings && full.prayerTimings[0]) || {},
          contacts: full.contacts || [],
          address: full.address || "",
        },
        fullDetailsLoading: false,
      },
    ];
  };

  const onSelectFromSheet = async (m) => {
    if (!m || !m._id) return;

    let selectedFull = null;

    // 1) If masjid belongs to different area → load that area first
    if (m.areaId && m.areaId !== selectedArea) {
      setArea(m.areaId);
      await loadMasjidsByArea(m.areaId);
    }

    // 2) Ensure we have full masjid details
    try {
      selectedFull = await publicAPI.getMasjidById(m._id);
    } catch {
      showToast("error", "Failed to load masjid");
      return;
    }

    const prepared = prepareSingle(selectedFull);

    // 3) Put selected masjid at TOP always
    setMasjids((prev) => {
      const others = prev.filter((x) => x._id !== m._id);
      return [...prepared, ...others];
    });

    // 4) Update global store
    setMasjid(selectedFull);

    // 5) Close UI
    setSearchQuery("");
    setShowSearchResults(false);
    setSheetOpen(false);

    // 6) Scroll to carousel
    setTimeout(() => {
      carouselRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  /* -----------------------------------------
      Expand card (fetch full details)
  ------------------------------------------*/
  const handleExpand = async (mLight) => {
    if (!mLight || !mLight._id) return;

    // mark loading
    setMasjids((prev) =>
      prev.map((x) =>
        x._id === mLight._id ? { ...x, fullDetailsLoading: true } : x
      )
    );

    try {
      const full = await publicAPI.getMasjidById(mLight._id);
      if (!mountedRef.current) return;

      // update local list
      setMasjids((prev) =>
        prev.map((x) =>
          x._id === mLight._id
            ? {
                ...x,
                fullDetails: {
                  prayerTimings:
                    (full.prayerTimings && full.prayerTimings[0]) || {},
                  contacts: full.contacts || [],
                  address: full.address || "",
                },
                fullDetailsLoading: false,
              }
            : x
        )
      );

      // update global store
      setMasjid(full);

      // update SEO
      const fullName = `${full.name}, ${full.area?.name || ""}, ${
        full.city?.name || ""
      }`;
      document.title = `${fullName} — Prayer Timings | City Salah`;
    } catch {
      showToast("error", "Failed to load masjid details");
      setMasjids((prev) =>
        prev.map((x) =>
          x._id === mLight._id ? { ...x, fullDetailsLoading: false } : x
        )
      );
    }
  };

  /* -----------------------------------------
      RETURN JSX
  ------------------------------------------*/
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-3xl mx-auto px-2 py-3 space-y-3">
        {/* SEARCH BAR */}
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
          results={searchResults}
          showResults={showSearchResults}
          onSelect={(m) => {
            setSearchQuery("");
            setShowSearchResults(false);
            onSelectFromSheet(m);
          }}
        />

        {/* LOCATION BAR */}
        <LocationBar
          cityName={cities.find((c) => c._id === selectedCity)?.name || ""}
          areaName={areas.find((a) => a._id === selectedArea)?.name || ""}
          onOpen={() => setSheetOpen(true)}
        />

        {/* CAROUSEL */}
        <div className="mt-4">
          {loadingMasjids || loadingNearest || loadingLocation ? (
            <div className="space-y-3">
              <MasjidInfoLoader />
              <PrayerTimingsLoader />
              <ContactInfoLoader />
            </div>
          ) : masjids.length ? (
            <MasjidCarousel
              masjids={masjids}
              selectedMasjidId={selectedMasjid?._id}
              onSelect={() => {}}
              onExpand={handleExpand}
              carouselRef={carouselRef}
            />
          ) : (
            <div className="text-center py-20 text-slate-600">
              No masjids found. Please choose city/area.
            </div>
          )}
        </div>
      </div>

      {/* FLOATING BUTTON */}
      <div className="fixed right-4 bottom-6 z-50">
        <button
          onClick={() => setSheetOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-xl"
        >
          📍
        </button>
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
        onSelectMasjid={onSelectFromSheet}
      />
    </div>
  );
}
