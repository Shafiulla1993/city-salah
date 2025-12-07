// src/context/MasjidContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MasjidContext = createContext(null);

export function MasjidProvider({ children }) {
  // Core data
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMasjid, setSelectedMasjid] = useState(null);

  const [prayerTimings, setPrayerTimings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // ---------- Load from localStorage on first mount ----------
  useEffect(() => {
    try {
      const city = localStorage.getItem("selectedCityId");
      const area = localStorage.getItem("selectedAreaId");
      const masjid = localStorage.getItem("selectedMasjidId");

      if (city) setSelectedCity(city);
      if (area) setSelectedArea(area);
      if (masjid) setSelectedMasjid({ _id: masjid });
    } catch (err) {
      console.error("Failed to read masjid selection from localStorage", err);
    }
  }, []);

  // ---------- Persist to localStorage (option B) ----------
  useEffect(() => {
    try {
      if (selectedCity) localStorage.setItem("selectedCityId", selectedCity);
      else localStorage.removeItem("selectedCityId");
    } catch {}
  }, [selectedCity]);

  useEffect(() => {
    try {
      if (selectedArea) localStorage.setItem("selectedAreaId", selectedArea);
      else localStorage.removeItem("selectedAreaId");
    } catch {}
  }, [selectedArea]);

  useEffect(() => {
    try {
      if (selectedMasjid?._id)
        localStorage.setItem("selectedMasjidId", selectedMasjid._id);
      else localStorage.removeItem("selectedMasjidId");
    } catch {}
  }, [selectedMasjid]);

  const value = {
    // data
    cities,
    areas,
    masjids,
    selectedCity,
    selectedArea,
    selectedMasjid,
    prayerTimings,
    contacts,

    // setters
    setCities,
    setAreas,
    setMasjids,
    setSelectedCity,
    setSelectedArea,
    setSelectedMasjid,
    setPrayerTimings,
    setContacts,
  };

  return (
    <MasjidContext.Provider value={value}>{children}</MasjidContext.Provider>
  );
}

export function useMasjid() {
  const ctx = useContext(MasjidContext);
  if (!ctx) {
    throw new Error("useMasjid must be used inside MasjidProvider");
  }
  return ctx;
}
