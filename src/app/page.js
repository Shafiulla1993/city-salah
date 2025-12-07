// src/app/page.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import MasjidSelector from "@/components/RightPanel/MasjidSelector";
import MasjidInfo from "@/components/RightPanel/MasjidInfo";
import PrayerTimingsTable from "@/components/RightPanel/PrayerTimingsTable";
import ContactInfo from "@/components/RightPanel/ContactInfo";

import { publicAPI } from "@/lib/api/public";
import { useAuth } from "@/context/AuthContext";
import { useMasjid } from "@/context/MasjidContext";

import {
  MasjidInfoLoader,
  PrayerTimingsLoader,
  ContactInfoLoader,
} from "@/components/RightPanel/loaders";

export default function ClientHome() {
  // ---------- GLOBAL MASJID STATE (persists across pages) ----------
  const {
    cities,
    areas,
    masjids,
    selectedCity,
    selectedArea,
    selectedMasjid,
    prayerTimings,
    contacts,
    setCities,
    setAreas,
    setMasjids,
    setSelectedCity,
    setSelectedArea,
    setSelectedMasjid,
    setPrayerTimings,
    setContacts,
  } = useMasjid();

  // ---------- LOCAL LOADING FLAGS ----------
  const [loadingCities, setLoadingCities] = useState(cities.length === 0);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [loadingMasjidDetails, setLoadingMasjidDetails] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { user } = useAuth();

  const showToast = useCallback((type, msg) => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  }, []);

  // ---------- 1. Load Cities (only once per app session) ----------
  useEffect(() => {
    if (cities.length > 0) {
      setLoadingCities(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await publicAPI.getCities();
        if (!cancelled) setCities(res || []);
      } catch {
        showToast("error", "Failed to load cities");
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cities.length, setCities, showToast]);

  // ---------- 2. Load Areas when city selected ----------
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      // Do NOT reset selection from context here; user might return with saved area
      return;
    }

    // Already have areas for this city? don't refetch
    if (areas.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoadingAreas(true);
      try {
        const res = await publicAPI.getAreas(selectedCity);
        if (!cancelled) setAreas(res || []);
      } catch {
        showToast("error", "Failed to load areas");
      } finally {
        if (!cancelled) setLoadingAreas(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCity, areas.length, setAreas, showToast]);

  // ---------- 3. Load Masjids when area selected ----------
  useEffect(() => {
    if (!selectedArea) {
      setMasjids([]);
      return;
    }

    if (masjids.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoadingMasjids(true);
      try {
        const res = await publicAPI.getMasjids({ areaId: selectedArea });
        if (!cancelled) setMasjids(res || []);

        const saved = localStorage.getItem("selectedMasjidId");
        if (!cancelled && saved && res?.length) {
          const found = res.find((m) => m._id === saved);
          if (found) setSelectedMasjid(found);
        }
      } catch {
        showToast("error", "Failed to load masjids");
      } finally {
        if (!cancelled) setLoadingMasjids(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedArea, masjids.length, setMasjids, setSelectedMasjid, showToast]);

  // ---------- 4. Load Masjid Details (once per selected masjid) ----------
  useEffect(() => {
    const id = selectedMasjid?._id;
    if (!id) {
      setPrayerTimings([]);
      setContacts([]);
      return;
    }

    if (prayerTimings.length > 0 && contacts.length > 0) return;

    let cancelled = false;

    (async () => {
      setLoadingMasjidDetails(true);
      try {
        const data = await publicAPI.getMasjidById(id);
        if (cancelled) return;
        setPrayerTimings(data.prayerTimings || []);
        setContacts(data.contacts || []);
        setSelectedMasjid(data);
      } catch {
        showToast("error", "Could not load masjid details");
      } finally {
        if (!cancelled) setLoadingMasjidDetails(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    selectedMasjid?._id,
    prayerTimings.length,
    contacts.length,
    setPrayerTimings,
    setContacts,
    setSelectedMasjid,
    showToast,
  ]);

  // ---------- 5. Auto detect nearest masjid (only if no selection yet) ----------
  useEffect(() => {
    if (
      selectedMasjid ||
      selectedCity ||
      cities.length > 0 ||
      areas.length > 0 ||
      masjids.length > 0
    ) {
      return;
    }

    let cancelled = false;

    const detectLocation = async () => {
      if (!navigator.geolocation) return;
      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const nearest = await publicAPI.getNearestMasjids({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              limit: 1,
            });

            if (cancelled) return;

            if (!nearest?.length) {
              setLoadingLocation(false);
              return;
            }

            const m = nearest[0];
            const cityId = m.city?._id || m.city || "";
            const areaId = m.area?._id || m.area || "";

            setSelectedCity(cityId);
            setSelectedArea(areaId);

            const full = await publicAPI.getMasjidById(m._id);
            if (!cancelled) setSelectedMasjid(full);
          } catch {
            if (!cancelled) {
              showToast("error", "Location lookup failed — select manually.");
            }
          } finally {
            if (!cancelled) setLoadingLocation(false);
          }
        },
        () => {
          if (!cancelled) setLoadingLocation(false);
        }
      );
    };

    detectLocation();

    return () => {
      cancelled = true;
    };
  }, [
    selectedMasjid,
    selectedCity,
    cities.length,
    areas.length,
    masjids.length,
    setSelectedCity,
    setSelectedArea,
    setSelectedMasjid,
    showToast,
    user,
  ]);

  // ---------- UI ----------
  return (
    <div className="min-h-screen w-full bg-slate-300/40 px-3 py-5">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Selector */}
        {loadingCities ? (
          <div className="flex gap-2 justify-center">
            <div className="h-12 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-12 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-12 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          <MasjidSelector
            cities={cities}
            areas={areas}
            masjids={masjids}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
            selectedMasjid={selectedMasjid}
            setSelectedCity={(c) => {
              setSelectedCity(c);
              setSelectedArea("");
              setMasjids([]);
              setSelectedMasjid(null);
              setPrayerTimings([]);
              setContacts([]);
            }}
            setSelectedArea={(a) => {
              setSelectedArea(a);
              setSelectedMasjid(null);
              setMasjids([]);
              setPrayerTimings([]);
              setContacts([]);
            }}
            setSelectedMasjid={(m) => {
              setSelectedMasjid(m);
              setPrayerTimings([]);
              setContacts([]);
            }}
          />
        )}

        {/* Masjid Details */}
        <div className="space-y-6">
          {loadingMasjidDetails ? (
            <>
              <MasjidInfoLoader />
              <PrayerTimingsLoader />
              <ContactInfoLoader />
            </>
          ) : selectedMasjid ? (
            <>
              <MasjidInfo masjid={selectedMasjid} />
              <PrayerTimingsTable
                prayerTimings={prayerTimings}
                loading={loadingMasjidDetails}
                masjidSelected={!!selectedMasjid}
              />
              <ContactInfo contacts={contacts} />
            </>
          ) : (
            !loadingLocation && (
              <p className="text-center text-lg font-semibold text-slate-700 py-6">
                Please select your City → Area → Masjid to view Salah timings.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
