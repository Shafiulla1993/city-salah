// src/components/auqatus/AuqatusCards.js

"use client";

function to12Hour(time) {
  if (!time) return "--";

  if (typeof time === "number") {
    const m = time % 60;
    let h = Math.floor(time / 60);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  if (typeof time === "string") {
    if (/am|pm/i.test(time)) return time.toUpperCase();
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

  return "--";
}

function PrayerCard({ title, start, end, isCurrent }) {
  return (
    <div
      className={`
        relative bg-white rounded-2xl overflow-hidden border shadow-xl
        ${isCurrent ? "ring-2 ring-emerald-500 scale-[1.02]" : ""}
      `}
    >
      {/* Header strip */}
      <div
        className={`
          px-4 py-2 text-white text-sm font-semibold text-center
          ${isCurrent ? "bg-emerald-700" : "bg-slate-900"}
        `}
      >
        {title}
      </div>

      {/* Body */}
      <div className="px-2 py-4 grid grid-cols-2 gap-2">
        {/* Start */}
        <div className="text-left">
          <div className="text-sm font-medium text-sky-700">Starts</div>
          <div className="text-lg font-bold text-sky-900 whitespace-nowrap">
            {to12Hour(start)}
          </div>
        </div>

        {/* End */}
        <div className="text-right">
          <div className="text-sm font-medium text-rose-700">Ends</div>
          <div className="text-lg font-bold text-rose-800 whitespace-nowrap">
            {to12Hour(end)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuqatusCards({ slots = [] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((s, idx) => (
        <PrayerCard
          key={`${s.label}-${idx}`}
          title={s.label}
          start={s.start}
          end={s.end}
          isCurrent={s.highlight}
        />
      ))}
    </div>
  );
}
