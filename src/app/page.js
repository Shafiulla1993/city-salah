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

import {
  MasjidInfoLoader,
  PrayerTimingsLoader,
  ContactInfoLoader,
} from "@/components/RightPanel/loaders";

export default function ClientHome() {
  // ---------- DATA ----------
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMasjid, setSelectedMasjid] = useState(null);

  const [prayerTimings, setPrayerTimings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // ---------- LOADING ----------
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [loadingMasjidDetails, setLoadingMasjidDetails] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { user } = useAuth();

  // ---------- Toast ----------
  const showToast = useCallback((type, msg) => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  }, []);

  // ---------- Load previously selected masjid from localStorage ----------
  useEffect(() => {
    const savedMasjidId = localStorage.getItem("selectedMasjidId");
    const savedCity = localStorage.getItem("selectedCityId");
    const savedArea = localStorage.getItem("selectedAreaId");

    if (savedCity) setSelectedCity(savedCity);
    if (savedArea) setSelectedArea(savedArea);

    // Masjid will be fetched later once masjid list loads
    if (savedMasjidId) {
      setSelectedMasjid({ _id: savedMasjidId });
    }
  }, []);

  // ---------- 1. Load Cities ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await publicAPI.getCities();
        if (mounted) setCities(res || []);
      } catch {
        showToast("error", "Failed to load cities");
      } finally {
        if (mounted) setLoadingCities(false);
      }
    })();
    return () => (mounted = false);
  }, [showToast]);

  // ---------- 2. Load Areas ----------
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      setSelectedArea("");
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingAreas(true);
      try {
        const res = await publicAPI.getAreas(selectedCity);
        if (mounted) setAreas(res || []);
      } catch {
        showToast("error", "Failed to load areas");
      } finally {
        if (mounted) setLoadingAreas(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedCity, showToast]);

  // ---------- 3. Load Masjids ----------
  useEffect(() => {
    if (!selectedArea) {
      setMasjids([]);
      setSelectedMasjid(null);
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingMasjids(true);
      try {
        const res = await publicAPI.getMasjids({ areaId: selectedArea });
        if (mounted) setMasjids(res || []);

        // auto-select saved masjid once list loads
        const savedMasjidId = localStorage.getItem("selectedMasjidId");
        if (savedMasjidId && res?.length) {
          const found = res.find((m) => m._id === savedMasjidId);
          if (found) setSelectedMasjid(found);
        }
      } catch {
        showToast("error", "Failed to load masjids");
      } finally {
        if (mounted) setLoadingMasjids(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedArea, showToast]);

  // ---------- 4. Load Masjid Details ----------
  useEffect(() => {
    if (!selectedMasjid?._id) {
      setPrayerTimings([]);
      setContacts([]);
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingMasjidDetails(true);
      try {
        const data = await publicAPI.getMasjidById(selectedMasjid._id);
        if (!mounted) return;
        setPrayerTimings(data.prayerTimings || []);
        setContacts(data.contacts || []);
        setSelectedMasjid(data);
      } catch {
        showToast("error", "Could not load masjid details");
      } finally {
        if (mounted) setLoadingMasjidDetails(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedMasjid?._id, showToast]);

  // ---------- Save selection to localStorage whenever user picks a masjid ----------
  // When city selected
  useEffect(() => {
    if (!selectedCity) return;

    localStorage.setItem("selectedCityId", selectedCity);

    // 🔥 When changing city, area & masjid should be cleared
    localStorage.removeItem("selectedAreaId");
    localStorage.removeItem("selectedMasjidId");
  }, [selectedCity]);

  // When area selected
  useEffect(() => {
    if (!selectedArea) return;

    localStorage.setItem("selectedAreaId", selectedArea);

    // 🔥 When changing area, masjid should be cleared
    localStorage.removeItem("selectedMasjidId");
  }, [selectedArea]);

  // When masjid selected
  useEffect(() => {
    if (selectedMasjid?._id) {
      localStorage.setItem("selectedMasjidId", selectedMasjid._id);
    }
  }, [selectedMasjid]);

  useEffect(() => {
    if (selectedCity) localStorage.setItem("selectedCityId", selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (selectedArea) localStorage.setItem("selectedAreaId", selectedArea);
  }, [selectedArea]);

  // ---------- 5. Auto Location ----------
  useEffect(() => {
    let mounted = true;
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

            if (!nearest?.length) {
              showToast(
                "info",
                "Couldn't detect nearest masjid — select manually."
              );
              setLoadingLocation(false);
              return;
            }

            const m = nearest[0];
            const cityId = m.city?._id || m.city || "";
            const areaId = m.area?._id || m.area || "";

            setSelectedCity(cityId);
            setSelectedArea(areaId);

            const full = await publicAPI.getMasjidById(m._id);
            if (mounted) setSelectedMasjid(full);
          } catch {
            showToast("error", "Location lookup failed — select manually.");
          } finally {
            setLoadingLocation(false);
          }
        },
        () => setLoadingLocation(false)
      );
    };

    detectLocation();
    return () => (mounted = false);
  }, [showToast, user]);

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
            }}
            setSelectedArea={(a) => {
              setSelectedArea(a);
              setSelectedMasjid(null);
            }}
            setSelectedMasjid={setSelectedMasjid}
          />
        )}

        {/* Main Masjid View */}
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
