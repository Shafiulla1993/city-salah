// src/app/home/ClientHome.js
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

export default function ClientHome() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMasjid, setSelectedMasjid] = useState(null);

  const [prayerTimings, setPrayerTimings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // 1. LOAD USER LOCATION MASJID
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

          // Fetch full masjid details now
          const fullMasjid = await publicAPI.getMasjidById(m._id);
          setSelectedMasjid(fullMasjid);
        }
      } catch (err) {
        console.log("Location masjid error:", err);
      }
    });
  }, []);

  // LOAD CITIES
  useEffect(() => {
    publicAPI.getCities().then(setCities).catch(console.error);
  }, []);

  // LOAD AREAS WHEN CITY CHANGES
  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      setSelectedArea("");
      return;
    }
    publicAPI.getAreas(selectedCity).then(setAreas).catch(console.error);
  }, [selectedCity]);

  // LOAD MASJIDS WHEN AREA CHANGES
  useEffect(() => {
    if (!selectedArea) {
      setMasjids([]);
      setSelectedMasjid(null);
      return;
    }

    publicAPI
      .getMasjids({ areaId: selectedArea })
      .then(setMasjids)
      .catch(console.error);
  }, [selectedArea]);

  // LOAD MASJID DETAILS
  useEffect(() => {
    if (!selectedMasjid?._id) return;

    publicAPI
      .getMasjidById(selectedMasjid._id)
      .then((data) => {
        setPrayerTimings(data.prayerTimings || []);
        setContacts(data.contacts || []);
      })
      .catch(console.error);

    console.log(selectedMasjid.prayerTimings);
  }, [selectedMasjid]);

  const left = (
    <>
      <GeneralAnnouncements />
      <ThoughtOfDay />
      <MasjidAnnouncements masjidId={selectedMasjid?._id} />
    </>
  );

  const right = (
    <>
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

      <MasjidInfo masjid={selectedMasjid} />
      <PrayerTimingsTable prayerTimings={prayerTimings} />
      <ContactInfo contacts={contacts} />
    </>
  );

  return <DashboardLayout left={left} right={right} />;
}
