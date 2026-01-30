// src/app/dashboard/super-admin/manage/modules/hijri/HijriPreviewCard.js

"use client";

import PrayTimes from "praytimes";

export default function HijriPreviewCard({ globalOffset }) {
  const pt = new PrayTimes("Karachi");
  pt.adjust({ hijri: Number(globalOffset) });

  const today = new Date();

  // PrayTimes hijri comes from getTimes()
  const times = pt.getTimes(today, [0, 0], 0);
  const hijri = times.hijri;

  const isRamadan = hijri?.month === 9;

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      <h3 className="font-medium mb-2">Today Preview</h3>

      <div className="text-sm space-y-1">
        <p>
          <strong>Gregorian:</strong> {today.toLocaleDateString()}
        </p>

        {hijri ? (
          <>
            <p>
              <strong>Hijri:</strong> {hijri.day} {hijri.monthName} {hijri.year}{" "}
              AH
            </p>
            <p>
              <strong>Ramadan:</strong>{" "}
              {isRamadan ? `Yes (Roza ${hijri.day})` : "No"}
            </p>
          </>
        ) : (
          <p className="text-red-600">Hijri not available</p>
        )}
      </div>
    </div>
  );
}
