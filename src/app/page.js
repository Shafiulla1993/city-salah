// src/app/page.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import MasjidSelector from "@/components/masjid/MasjidSelector";
import MasjidInfo from "@/components/masjid/MasjidInfo";
import PrayerTimingsTable from "@/components/masjid/PrayerTimingsTable";
import ContactInfo from "@/components/masjid/ContactInfo";

import { publicAPI } from "@/lib/api/public";
import { useAuth } from "@/context/AuthContext";

import {
  MasjidInfoLoader,
  PrayerTimingsLoader,
  ContactInfoLoader,
} from "@/components/masjid/loaders";

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

  const [showScrollTop, setShowScrollTop] = useState(false);

  const { user } = useAuth();

  // ---------- Zustand store ----------
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

  // ---------- Helper names for SEO ----------
  const selectedCityName = cities.find((c) => c._id === selectedCity)?.name;
  const selectedAreaName = areas.find((a) => a._id === selectedArea)?.name;

  // ---------- Toast ----------
  const showToast = useCallback((type, msg) => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  }, []);

  // ---------- Init selection ----------
  useEffect(() => {
    init();
  }, [user, init]);

  // ---------- Scroll-to-top ----------
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    if (!selectedCity) return setAreas([]);
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
    if (!selectedArea) return setMasjids([]);
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
        setMasjid(data);
      } catch {
        showToast("error", "Could not load masjid details");
      } finally {
        if (mounted) setLoadingMasjidDetails(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedMasjid?._id, setMasjid, showToast]);

  // ---------- Dynamic SEO: title + meta ----------
  useEffect(() => {
    if (!selectedMasjid?.name) return;
    const title = `${selectedMasjid.name} — Prayer Timings | City Salah`;
    const description = `Prayer timings, Iqamah schedule and announcements for ${
      selectedMasjid.name
    }, ${selectedAreaName || ""} ${
      selectedCityName || ""
    }. View Salah times instantly on CitySalah.`;

    document.title = title;
    let meta = document.querySelector("meta[name='description']");
    if (meta) meta.setAttribute("content", description);
  }, [selectedMasjid, selectedAreaName, selectedCityName]);

  // ---------- Dynamic JSON-LD ----------
  useEffect(() => {
    if (!selectedMasjid?.name) return;

    const ldJson = {
      "@context": "https://schema.org",
      "@type": "Mosque",
      name: selectedMasjid.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: selectedMasjid.address || "",
        addressLocality: selectedAreaName || "",
        addressRegion: selectedCityName || "Karnataka",
        addressCountry: "India",
      },
      url: "https://citysalah.in",
      description: `Prayer timings and announcements for ${selectedMasjid.name}`,
      image: selectedMasjid.image || "",
    };

    let script = document.getElementById("masjid-schema");
    if (!script) {
      script = document.createElement("script");
      script.id = "masjid-schema";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ldJson);
  }, [selectedMasjid, selectedAreaName, selectedCityName]);

  // ---------- UI ----------
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-3xl mx-auto space-y-3 px-2 py-3">
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

        {/* 🔹 Hidden SEO block visible only to Google */}
        <div
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            margin: "-1px",
            padding: "0",
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
            border: "0",
          }}
        >
          City Salah (also written as CitySalah) provides accurate masjid-based
          prayer timings, Iqamah schedules and community announcements for
          cities including Mysuru, Nanjangud, Bengaluru, Mandya and more.
        </div>

        {/* Main Masjid View */}
        <div className="space-y-2">
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

      {showScrollTop && (
        <button
          aria-label="Scroll to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="
            fixed bottom-6 right-6 md:right-10 lg:right-12
            bg-indigo-600 hover:bg-indigo-700 
            text-white w-12 h-12 rounded-full 
            shadow-xl flex items-center justify-center 
            text-2xl transition-all active:scale-95 z-[999]"
        >
          ↑
        </button>
      )}
    </div>
  );
}
