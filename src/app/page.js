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

import { useMasjidStore } from "@/store/useMasjidStore";

export default function ClientHome() {
  // ---------- DATA (local) ----------
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [prayerTimings, setPrayerTimings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // ---------- LOADING (local) ----------
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [loadingMasjidDetails, setLoadingMasjidDetails] = useState(false);

  const { user } = useAuth();

  // ---------- Zustand store (global selection) ----------
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

  // ---------- Toast ----------
  const showToast = useCallback((type, msg) => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  }, []);

  // ---------- Init selection logic (once per tab) ----------
  useEffect(() => {
    // user may be null initially and later filled
    init(user);
  }, [user, init]);

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

  // ---------- 2. Load Areas (depends on selectedCity from store) ----------
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
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

  // ---------- 3. Load Masjids (depends on selectedArea from store) ----------
  useEffect(() => {
    if (!selectedArea) {
      setMasjids([]);
      // DO NOT reset selectedMasjid here; store manages it
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingMasjids(true);
      try {
        const res = await publicAPI.getMasjids({ areaId: selectedArea });
        if (mounted) setMasjids(res || []);
      } catch {
        showToast("error", "Failed to load masjids");
      } finally {
        if (mounted) setLoadingMasjids(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedArea, showToast]);

  // ---------- 4. Load Masjid Details (depends on selectedMasjid from store) ----------
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
        // also keep latest data in store
        setMasjid(data);
      } catch {
        showToast("error", "Could not load masjid details");
      } finally {
        if (mounted) setLoadingMasjidDetails(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedMasjid?._id, setMasjid, showToast]);

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
            setSelectedCity={setCity}
            setSelectedArea={setArea}
            setSelectedMasjid={setMasjid}
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
