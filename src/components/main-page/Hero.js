// src/app/components/Hero.js

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative text-center px-4 py-12 overflow-hidden">
      <div className="relative max-w-4xl mx-auto space-y-4">
        {/* Ramzan Highlight (Clickable) */}
        <Link
          href="/ramzan-timetable"
          className="
            inline-block px-6 py-2 rounded-full 
            border border-yellow-200/40 
            bg-white/10 backdrop-blur
            hover:bg-white/20 transition
            animate-pulse
          "
        >
          <span className="text-yellow-200 font-semibold tracking-wide drop-shadow-md">
            🌙 Ramzan 2026 Timetable Now Added
          </span>
        </Link>

        {/* Pre-Ramzan Callout */}
        <div className="mt-3 text-slate-100 sm:text-lg font-medium">
          Get ready for the holy month · Explore your local Sehri & Iftar
          timings · Stay connected with{" "}
          <span className="text-yellow-100 font-semibold">CitySalah</span>
        </div>
      </div>
    </section>
  );
}
