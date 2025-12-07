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
  const {
    cities,
    areas,
    masjids,
    selectedCity,
    selectedArea,
    selectedMasjid,
    prayerTimings,
    contacts,
    hasAutoLocated,
    setCities,
    setAreas,
    setMasjids,
    setSelectedCity,
    setSelectedArea,
    setSelectedMasjid,
    setPrayerTimings,
    setContacts,
    setHasAutoLocated,
  } = useMasjid();

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

  // ---------- 1. Load Cities ----------
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
    return () => (cancelled = true);
  }, [cities.length, setCities, showToast]);

  // ---------- 2. Load Areas ----------
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    setLoadingAreas(true);
    (async () => {
      try {
        const res = await publicAPI.getAreas(selectedCity);
        if (!cancelled) setAreas(res || []);
      } catch {
        showToast("error", "Failed to load areas");
      } finally {
        if (!cancelled) setLoadingAreas(false);
      }
    })();
    return () => (cancelled = true);
  }, [selectedCity, setAreas, showToast]);

  // ---------- 3. Load Masjids ----------
  useEffect(() => {
    if (!selectedArea) {
      setMasjids([]);
      return;
    }
    let cancelled = false;
    setLoadingMasjids(true);
    (async () => {
      try {
        const res = await publicAPI.getMasjids({ areaId: selectedArea });
        if (!cancelled) setMasjids(res || []);
      } catch {
        showToast("error", "Failed to load masjids");
      } finally {
        if (!cancelled) setLoadingMasjids(false);
      }
    })();
    return () => (cancelled = true);
  }, [selectedArea, setMasjids, showToast]);

  // ---------- 4. Load Masjid Details ----------
  useEffect(() => {
    const id = selectedMasjid?._id;
    if (!id) {
      setPrayerTimings([]);
      setContacts([]);
      return;
    }
    let cancelled = false;
    setLoadingMasjidDetails(true);
    (async () => {
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
    return () => (cancelled = true);
  }, [
    selectedMasjid?._id,
    setPrayerTimings,
    setContacts,
    setSelectedMasjid,
    showToast,
  ]);

  // ---------- 5. Auto detect nearest masjid on manual refresh only ----------
  useEffect(() => {
    if (hasAutoLocated) return; // ALWAYS run on first mount after refresh

    let cancelled = false;

    const detectNearest = async () => {
      if (!navigator.geolocation) {
        setHasAutoLocated(true);
        return;
      }

      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const nearest = await publicAPI.getNearestMasjids({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              limit: 1,
            });

            if (cancelled || !nearest?.length) {
              setHasAutoLocated(true);
              setLoadingLocation(false);
              return;
            }

            const m = nearest[0];
            const cityId = m.city?._id || m.city;
            const areaId = m.area?._id || m.area;

            // FORCE override selection on page reload
            setSelectedCity(cityId);
            setAreas([]); // important to trigger fresh area load
            setSelectedArea(areaId);
            setMasjids([]); // important to trigger fresh masjid load

            const full = await publicAPI.getMasjidById(m._id);
            if (!cancelled) {
              setSelectedMasjid(full);
              setPrayerTimings(full.prayerTimings || []);
              setContacts(full.contacts || []);
            }
          } catch {
            showToast("error", "Location lookup failed — select manually.");
          } finally {
            if (!cancelled) {
              setHasAutoLocated(true);
              setLoadingLocation(false);
            }
          }
        },
        () => {
          setHasAutoLocated(true);
          setLoadingLocation(false);
        }
      );
    };

    detectNearest();
    return () => (cancelled = true);
  }, [
    hasAutoLocated,
    setHasAutoLocated,
    setSelectedCity,
    setSelectedArea,
    setSelectedMasjid,
    setPrayerTimings,
    setContacts,
    setAreas,
    setMasjids,
    showToast,
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
              setAreas([]); // 🔥 FIX: force refetch areas
              setSelectedArea("");
              setMasjids([]); // 🔥 FIX: force refetch masjids
              setSelectedMasjid(null);
              setPrayerTimings([]);
              setContacts([]);
            }}
            setSelectedArea={(a) => {
              setSelectedArea(a);
              setMasjids([]); // 🔥 FIX
              setSelectedMasjid(null);
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
