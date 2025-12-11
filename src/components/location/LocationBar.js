// src/components/location/LocationBar.js
// Sticky pill-style location bar (mobile-first)

"use client";

import { motion } from "framer-motion";
import { FiMapPin, FiChevronDown } from "react-icons/fi";

export default function LocationBar({ cityName, areaName, onOpen }) {
  const label =
    cityName && areaName ? `${cityName} → ${areaName}` : "Select Location";

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="sticky top-16 z-40 w-full flex justify-center px-4"
    >
      <button
        onClick={onOpen}
        className="flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-300 rounded-full shadow-md px-4 py-2 text-slate-800 font-medium active:scale-95 transition"
      >
        <FiMapPin className="text-indigo-600 text-lg" />
        <span className="text-sm whitespace-nowrap">{label}</span>
        <FiChevronDown className="text-slate-600" />
      </button>
    </motion.div>
  );
}
