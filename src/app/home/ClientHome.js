"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import MasjidAnnouncements from "@/components/LeftPanel/MasjidAnnouncements";
import GeneralAnnouncements from "@/components/LeftPanel/GeneralAnnouncements";
import ThoughtOfDay from "@/components/LeftPanel/ThoughtOfDay";

import MasjidSelector from "@/components/RightPanel/MasjidSelector";
import MasjidInfo from "@/components/RightPanel/MasjidInfo";
import PrayerTimingsTable from "@/components/RightPanel/PrayerTimingsTable";
import ContactInfo from "@/components/RightPanel/ContactInfo";

import { publicAPI } from "@/lib/api/public";

// Skeleton components
import Skeleton from "@/components/ui/Skeleton";

export default function ClientHome() {
  /** -----------------------------
   * STATES
   * ------------------------------*/
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMasjid, setSelectedMasjid] = useState(null);

  const [prayerTimings, setPrayerTimings] = useState([]);
  const [contacts, setContacts] = useState([]);

  /** -----------------------------
   * LOADING STATES
   * ------------------------------*/
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingMasjids, setLoadingMasjids] = useState(false);
  const [loadingMasjidDetails, setLoadingMasjidDetails] = useState(false);

  /** -----------------------------
   * 1. AUTO-DETECT USER LOCATION MASJID
   * ------------------------------*/
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const nearest = await publicAPI.getNearestMasjids({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          limit: 1,
        });

        if (nearest?.length) {
          const m = nearest[0];

          setSelectedCity(m.cityId);
          setSelectedArea(m.areaId);

          const fullMasjid = await publicAPI.getMasjidById(m._id);
          setSelectedMasjid(fullMasjid);
        }
      } catch (err) {
        console.log("Location masjid error:", err);
      }
    });
  }, []);

  /** -----------------------------
   * 2. LOAD CITIES (INITIAL)
   * ------------------------------*/
  useEffect(() => {
    async function loadCities() {
      setLoadingCities(true);
      try {
        const res = await publicAPI.getCities();
        setCities(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  /** -----------------------------
   * 3. LOAD AREAS WHEN CITY CHANGES
   * ------------------------------*/
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      setSelectedArea("");
      return;
    }

    async function loadAreas() {
      setLoadingAreas(true);
      try {
        const res = await publicAPI.getAreas(selectedCity);
        setAreas(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAreas(false);
      }
    }

    loadAreas();
  }, [selectedCity]);

  /** -----------------------------
   * 4. LOAD MASJIDS WHEN AREA CHANGES
   * ------------------------------*/
  useEffect(() => {
    if (!selectedArea) {
      setMasjids([]);
      setSelectedMasjid(null);
      return;
    }

    async function loadMasjids() {
      setLoadingMasjids(true);
      try {
        const res = await publicAPI.getMasjids({ areaId: selectedArea });
        setMasjids(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMasjids(false);
      }
    }

    loadMasjids();
  }, [selectedArea]);

  /** -----------------------------
   * 5. LOAD MASJID DETAILS
   * ------------------------------*/
  useEffect(() => {
    if (!selectedMasjid?._id) return;

    async function loadDetails() {
      setLoadingMasjidDetails(true);
      try {
        const data = await publicAPI.getMasjidById(selectedMasjid._id);
        setPrayerTimings(data.prayerTimings || []);
        setContacts(data.contacts || []);

        // update full details so components use fresh data
        setSelectedMasjid(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMasjidDetails(false);
      }
    }

    loadDetails();
  }, [selectedMasjid?._id]);

  /** -----------------------------
   * SKELETON: Masjid Selector Row
   * ------------------------------*/
  const SelectorSkeleton = () => (
    <div className="flex gap-2 p-2">
      <Skeleton className="h-12 w-40" />
      <Skeleton className="h-12 w-40" />
      <Skeleton className="h-12 w-40" />
    </div>
  );

  const left = (
    <>
      <GeneralAnnouncements />
      <ThoughtOfDay />
      <MasjidAnnouncements masjidId={selectedMasjid?._id} />
    </>
  );

  const right = (
    <>
      {/* -----------------------------
          Show selector skeleton while cities loading
      ------------------------------*/}
      {loadingCities ? (
        <SelectorSkeleton />
      ) : (
        <MasjidSelector
          cities={cities}
          areas={areas}
          masjids={masjids}
          selectedCity={selectedCity}
          selectedArea={selectedArea}
          selectedMasjid={selectedMasjid}
          setSelectedCity={setSelectedCity}
          setSelectedArea={setSelectedArea}
          setSelectedMasjid={setSelectedMasjid}
        />
      )}

      {/* AREA SKELETON */}
      {loadingAreas && (
        <div className="mt-2">
          <Skeleton className="h-12 w-40" />
        </div>
      )}

      {/* MASJIDS SKELETON */}
      {loadingMasjids && (
        <div className="mt-2">
          <Skeleton className="h-12 w-40" />
        </div>
      )}

      {/* -----------------------------
          MASJID DETAILS SKELETON
      ------------------------------*/}
      {loadingMasjidDetails ? (
        <div className="space-y-4 mt-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <>
          <MasjidInfo masjid={selectedMasjid} />
          <PrayerTimingsTable prayerTimings={prayerTimings} />
          <ContactInfo contacts={contacts} />
        </>
      )}
    </>
  );

  return <DashboardLayout left={left} right={right} />;
}
