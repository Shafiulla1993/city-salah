// src/components/auqatus/HijriHeader.js

"use client";

export default function HijriHeader({ hijri }) {
  if (!hijri) return null;

  return (
    <div className="bg-white rounded-2xl border shadow-md px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      {/* Hijri Date */}
      <div>
        <div className="text-xs text-slate-500 tracking-wide">
          Today’s Hijri Date
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">
            {hijri.day}
          </span>

          <span className="text-lg font-semibold text-emerald-700">
            {hijri.monthName}
          </span>

          <span className="text-sm font-medium text-slate-600">
            {hijri.year} AH
          </span>
        </div>
      </div>

      {/* Note */}
      <div className="text-[11px] text-slate-500 italic sm:text-right">
        Islamic date begins after Maghrib
      </div>
    </div>
  );
}
