// src/components/location/LocationSheet.js
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiSearch } from "react-icons/fi";

import { searchItems } from "@/lib/search/searchCore";
import { SEARCH_PRESETS } from "@/lib/search/searchPresets";

export default function LocationSheet({
  open,
  onClose,
  cities = [],
  areas = [],
  searchIndex = [],
  selectedCity,
  selectedArea,
  setSelectedCity,
  setSelectedArea,
  mode = "masjid", // "masjid" | "qibla"
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleCityChange = (e) => {
    const id = e.target.value;
    setSelectedCity(id);
    setSelectedArea("");
    setSearchQuery("");
  };

  const handleAreaChange = (e) => {
    const id = e.target.value;
    setSelectedArea(id);
    setSearchQuery("");
  };

  const scopedMasjids = useMemo(() => {
    if (!selectedCity || !searchIndex.length) return [];

    if (selectedCity && !selectedArea) {
      return searchIndex.filter(
        (m) => String(m.cityId) === String(selectedCity),
      );
    }

    return searchIndex.filter(
      (m) =>
        String(m.cityId) === String(selectedCity) &&
        String(m.areaId) === String(selectedArea),
    );
  }, [searchIndex, selectedCity, selectedArea]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return scopedMasjids;

    return searchItems({
      data: scopedMasjids,
      query: searchQuery,
      fields: SEARCH_PRESETS.MASJID_PUBLIC,
    });
  }, [scopedMasjids, searchQuery]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 w-full max-w-md bg-white rounded-t-3xl shadow-xl p-5"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-indigo-600 text-xl" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Select Location
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-200 text-slate-700 active:scale-95"
              >
                <FiX />
              </button>
            </div>

            {/* CITY */}
            <label className="text-sm font-medium text-slate-700">City</label>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full mt-1 mb-4 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* AREA */}
            <label className="text-sm font-medium text-slate-700">Area</label>
            <select
              value={selectedArea}
              onChange={handleAreaChange}
              disabled={!selectedCity}
              className={`w-full mt-1 mb-4 px-3 py-2 rounded-xl border ${
                selectedCity
                  ? "border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <option value="">Select Area</option>
              {areas.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>

            {mode === "qibla" && selectedCity && selectedArea && (
              <button
                onClick={() => {
                  const city = cities.find((c) => c._id === selectedCity);
                  const area = areas.find((a) => a._id === selectedArea);

                  if (!city || !area) return;

                  window.location.assign(`/${city.slug}/${area.slug}/qibla`);
                  onClose();
                }}
                className="w-full mb-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
              >
                View Qibla Direction for this Area
              </button>
            )}

            {/* SEARCH */}
            <label className="text-sm font-medium text-slate-700">
              Search Masjid
            </label>
            <div className="relative mt-1 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedArea}
                placeholder={
                  selectedArea ? "Search masjid..." : "Select area first"
                }
                className={`w-full px-4 py-2 rounded-xl border ${
                  selectedArea
                    ? "border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              />
              <FiSearch className="absolute right-3 top-2.5 text-slate-500 text-lg" />
            </div>

            {/* RESULTS */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((m) => {
                  console.log("Masjid Index Item:", m);

                  if (!m.citySlug || !m.areaSlug || !m.slug) return null;

                  return (
                    <button
                      key={`${m.slug}-${m._id}`}
                      onClick={() => {
                        if (!m.citySlug || !m.areaSlug) {
                          alert(
                            "Location not loaded yet. Please reopen selector.",
                          );
                          return;
                        }

                        window.location.assign(
                          `/${m.citySlug}/${m.areaSlug}/masjid/${m.slug}`,
                        );
                        onClose();
                      }}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-left active:scale-95"
                    >
                      <p className="font-semibold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">
                        {m.areaName}, {m.cityName}
                      </p>
                    </button>
                  );
                })
              ) : searchQuery ? (
                <p className="text-center text-slate-400 text-sm py-4">
                  No masjid found
                </p>
              ) : (
                <p className="text-center text-slate-400 text-sm py-4">
                  Start typing to search masjids…
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
