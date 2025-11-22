// src/app/page.js
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import MasjidAnnouncements from "@/components/LeftPanel/MasjidAnnouncements";
import GeneralAnnouncements from "@/components/LeftPanel/GeneralAnnouncements";
import ThoughtOfDay from "@/components/LeftPanel/ThoughtOfDay";

import MasjidSelector from "@/components/RightPanel/MasjidSelector";
import MasjidInfo from "@/components/RightPanel/MasjidInfo";
import PrayerTimingsTable from "@/components/RightPanel/PrayerTimingsTable";
import ContactInfo from "@/components/RightPanel/ContactInfo";

import { publicAPI } from "@/lib/api/public";
import { useAuth } from "@/context/AuthContext";

// loaders / skeletons
import {
  MasjidInfoLoader,
  PrayerTimingsLoader,
  ContactInfoLoader,
  AnnouncementBoxSkeleton,
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

  // ---------- AUTH ----------
  const { user, fetchLoginState } = useAuth();

  // ---------- Helpers ----------
  const showToast = useCallback((type, msg) => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  }, []);

  // ---------- 1. Load cities on mount ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCities(true);
      try {
        const res = await publicAPI.getCities();
        if (!mounted) return;
        setCities(res || []);
      } catch (err) {
        console.error("Failed to fetch cities", err);
        showToast("error", "Failed to load cities");
      } finally {
        if (mounted) setLoadingCities(false);
      }
    })();
    return () => (mounted = false);
  }, [showToast]);

  // ---------- 2. Areas when city changes ----------
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
        if (!mounted) return;
        setAreas(res || []);
      } catch (err) {
        console.error("Failed to fetch areas", err);
        showToast("error", "Failed to load areas");
      } finally {
        if (mounted) setLoadingAreas(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedCity, showToast]);

  // ---------- 3. Masjids when area changes ----------
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
        if (!mounted) return;
        setMasjids(res || []);
        // if only one masjid, optionally auto-select it (commented)
        // if (res?.length === 1) setSelectedMasjid(res[0]);
      } catch (err) {
        console.error("Failed to fetch masjids", err);
        showToast("error", "Failed to load masjids for selected area");
      } finally {
        if (mounted) setLoadingMasjids(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedArea, showToast]);

  // ---------- 4. Load masjid details when selected (or when selected changes) ----------
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
        setSelectedMasjid(data); // ensure full object is set
      } catch (err) {
        console.error("Failed to fetch masjid details", err);
        showToast("error", "Could not load masjid details");
      } finally {
        if (mounted) setLoadingMasjidDetails(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedMasjid?._id, showToast]);

  // ---------- 5. LOCATION FETCH: try to get nearest masjid from geolocation ----------
  // fallback sequence:
  // 1) location -> nearest masjid
  // 2) if fail and user logged in -> use user's city/area to load center masjid (first masjid in area)
  // 3) otherwise ask user to manually select
  useEffect(() => {
    let mounted = true;
    const tryLocationBased = async () => {
      if (!navigator.geolocation) return;
      setLoadingLocation(true);

      const success = async (pos) => {
        try {
          const nearest = await publicAPI.getNearestMasjids({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            limit: 1,
          });

          if (!mounted) return;

          if (nearest?.length) {
            const m = nearest[0];
            // m may include only minimal fields (id, coords) depending on endpoint
            // set selected city/area and then fetch full details
            setSelectedCity(m.cityId || m.city || "");
            setSelectedArea(m.areaId || m.area || "");
            setLoadingLocation(false);

            try {
              const full = await publicAPI.getMasjidById(m._id);
              if (!mounted) return;
              setSelectedMasjid(full);
              showToast("success", "Nearest masjid loaded from your location.");
            } catch (err) {
              // If getMasjidById fail — still set the minimal object (if available)
              console.warn("Failed to fetch full masjid after nearest:", err);
            }
            return;
          } else {
            // no nearest found
            setLoadingLocation(false);
            // fallback to user-saved area if available
            if (user?.area && (await tryUserAreaFallback())) return;
            // else show alert (UI will show a larger friendly message)
            showToast(
              "info",
              "Couldn't find nearest masjid — please select it manually."
            );
          }
        } catch (err) {
          console.error("Nearest masjid error", err);
          setLoadingLocation(false);
          // fallback to user area
          if (user?.area && (await tryUserAreaFallback())) return;
          showToast(
            "error",
            "Location lookup failed — please select masjid manually."
          );
        }
      };

      const error = async (err) => {
        console.warn("Geolocation error:", err);
        setLoadingLocation(false);
        // fallback to user area if logged in
        if (user?.area && (await tryUserAreaFallback())) return;
        // else show no-location alert (UI will display a big Daisy alert with instructions)
        showToast(
          "info",
          "Location access not allowed. Select masjid manually."
        );
      };

      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    };

    const tryUserAreaFallback = async () => {
      // If user is logged in, try to load city/area from user profile
      try {
        if (!user) return false;
        if (!user.city || !user.area) return false;

        // set selected city/area and load masjids in that area
        setSelectedCity(user.city);
        setSelectedArea(user.area);

        setLoadingMasjids(true);
        const res = await publicAPI.getMasjids({ areaId: user.area });
        setLoadingMasjids(false);

        if (res?.length) {
          // choose center/first masjid as fallback
          const first = await publicAPI.getMasjidById(res[0]._id);
          setSelectedMasjid(first);
          showToast("success", "Loaded masjid from your account area.");
          return true;
        }
        return false;
      } catch (err) {
        console.error("User area fallback failed", err);
        return false;
      }
    };

    // run once on mount
    tryLocationBased();

    return () => {
      mounted = false;
    };
  }, [user, showToast]);

  // ---------- UI blocks ----------
  const left = (
    <>
      <GeneralAnnouncements />
      <ThoughtOfDay />
      <MasjidAnnouncements masjidId={selectedMasjid?._id} />
    </>
  );

  // If location failed and no masjid selected — show a large DaisyUI warning block
  const locationWarning = (
    <div className="mt-4">
      <div className="alert alert-warning shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 
              4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 
              4c-.77-1.333-2.694-1.333-3.464 
              0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h3 className="font-bold text-lg">Couldn't detect nearest masjid</h3>
          <div className="text-sm">
            We couldn't fetch the nearest masjid from your location.{" "}
            {user
              ? "We'll try to load a masjid from your saved city/area. If that doesn't work, please select your masjid from the dropdowns on the right."
              : "Please select your City → Area → Masjid from the dropdowns to continue."}
          </div>
        </div>
      </div>
    </div>
  );

  const right = (
    <>
      {/* Masjid selector + skeletons */}
      {loadingCities ? (
        <div className="p-2">
          <div className="flex gap-2">
            <div className="h-12 w-44 rounded bg-slate-200 animate-pulse" />
            <div className="h-12 w-44 rounded bg-slate-200 animate-pulse" />
            <div className="h-12 w-44 rounded bg-slate-200 animate-pulse" />
          </div>
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

      {/* helpful instructions when nothing selected */}
      {!selectedMasjid && !loadingLocation && (
        <div className="mt-4 p-4 text-center">
          <p className="text-lg font-medium text-slate-800">
            Please select your City → Area → Masjid to view details.
          </p>
        </div>
      )}

      {/* Masjid details area */}
      <div className="mt-4 space-y-4">
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
          // If no masjid found/selected: show warning box (bigger text as requested)
          <div className="mt-4">
            {loadingLocation ? (
              <div className="text-center py-6">
                <div className="loading loading-dots loading-lg" />
                <p className="mt-3 text-slate-700">Detecting location...</p>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-xl font-semibold mb-2 text-slate-800">
                  No Masjid Loaded
                </h3>
                <p className="text-slate-700">
                  Could not fetch the nearest masjid. Please select a City, then
                  an Area, and then choose a Masjid from the dropdowns above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  return <DashboardLayout left={left} right={right} />;
}
