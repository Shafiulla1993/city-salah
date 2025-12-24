// src/components/location/LocationBar.js
// Sticky pill-style location bar (mobile-first, thumb-friendly)

"use client";

import { motion } from "framer-motion";
import { FiMapPin, FiChevronDown } from "react-icons/fi";

export default function LocationBar({ cityName, areaName, onOpen }) {
  const label =
    cityName && areaName ? `${cityName} → ${areaName}` : "Select city & area";

  return (
    <motion.div
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="sticky top-16 z-40 w-full px-4"
    >
      <button
        onClick={onOpen}
        className="
          w-full max-w-md mx-auto
          flex items-center justify-between
          gap-3
          px-5 py-3.5
          rounded-2xl
          bg-white/95 backdrop-blur
          border border-slate-300
          shadow-lg
          active:scale-[0.98]
          transition
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          <FiMapPin className="text-indigo-600 text-xl shrink-0" />

          <div className="flex flex-col text-left min-w-0">
            <span className="text-[11px] text-slate-500 uppercase tracking-wide">
              Location
            </span>
            <span className="text-sm font-semibold text-slate-900 truncate">
              {label}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <FiChevronDown className="text-slate-600 text-xl shrink-0" />
      </button>
    </motion.div>
  );
}
