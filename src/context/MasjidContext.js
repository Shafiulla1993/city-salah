// src/context/MasjidContext.js
"use client";

import { createContext, useContext, useState } from "react";

const MasjidContext = createContext(null);

export function MasjidProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMasjid, setSelectedMasjid] = useState(null);

  const [prayerTimings, setPrayerTimings] = useState([]);
  const [contacts, setContacts] = useState([]);

  // track if we already did auto-location this session
  const [hasAutoLocated, setHasAutoLocated] = useState(false);

  const value = {
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
  };

  return (
    <MasjidContext.Provider value={value}>{children}</MasjidContext.Provider>
  );
}

export function useMasjid() {
  const ctx = useContext(MasjidContext);
  if (!ctx) throw new Error("useMasjid must be used inside MasjidProvider");
  return ctx;
}
