// src/components/location/LocationSheet.js
// Full-screen bottom sheet for selecting City, Area, and Masjid Search

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiSearch } from "react-icons/fi";

export default function LocationSheet({
  open,
  onClose,
  cities,
  areas,
  searchIndex = [], // [{ _id, name, areaId }]
  selectedCity,
  selectedArea,
  setSelectedCity,
  setSelectedArea,
  onSelectMasjid,
}) {
  const handleCityChange = (e) => {
    const id = e.target.value;
    setSelectedCity(id);

    // Reset area & search results
    setSelectedArea("");
  };

  const handleAreaChange = (e) => {
    const id = e.target.value;
    setSelectedArea(id);
  };

  // ------------------ MASJID SEARCH ------------------
  const filteredMasjids = (keyword) => {
    if (!keyword.trim()) return [];
    keyword = keyword.toLowerCase();
    return searchIndex.filter((m) => m.name.toLowerCase().includes(keyword));
  };

  let searchResults = [];

  const onSearch = (e) => {
    const value = e.target.value;
    searchResults = filteredMasjids(value);
  };

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

            {/* CITY DROPDOWN */}
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

            {/* AREA DROPDOWN */}
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

            {/* MASJID SEARCH */}
            <label className="text-sm font-medium text-slate-700">
              Search Masjid
            </label>
            <div className="relative mt-1 mb-3">
              <input
                type="text"
                onChange={onSearch}
                placeholder="Search Masjid by name..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <FiSearch className="absolute right-3 top-2.5 text-slate-500 text-lg" />
            </div>

            {/* RESULTS LIST */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => {
                      onSelectMasjid(m);
                      onClose();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-left active:scale-95"
                  >
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">
                      Area ID: {m.areaId}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-center text-slate-400 text-sm py-4">
                  Start typing to search masjids...
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
