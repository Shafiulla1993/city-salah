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

function PrayerCard({ title, start, end, isCurrent, compact }) {
  return (
    <div
      className={`
        relative bg-white rounded-xl border shadow-md
-       ${compact ? "p-2" : "p-0"}
+       ${compact ? "p-1" : "p-0"}
        ${isCurrent ? "ring-2 ring-emerald-500" : ""}
      `}
    >
      <div
        className={`
          text-center font-semibold
-         ${compact ? "text-xs py-1" : "text-sm py-2"}
+         ${compact ? "text-[11px] py-[2px]" : "text-sm py-2"}
          ${isCurrent ? "bg-emerald-700 text-white" : "bg-slate-900 text-white"}
          rounded-t-xl
        `}
      >
        {title}
      </div>

      <div
        className={`grid grid-cols-2 ${compact ? "px-1 py-1" : "px-3 py-3"}`}
      >
        <div className="text-left">
          <div
            className={`${compact ? "text-[10px]" : "text-xs"} text-sky-700`}
          >
            Starts
          </div>
          <div
            className={`font-bold whitespace-nowrap ${
              -compact
                ? "text-sm"
                : "text-lg" + compact
                  ? "text-base"
                  : "text-lg"
            } text-sky-900`}
          >
            {to12Hour(start)}
          </div>
        </div>

        <div className="text-right">
          <div
            className={`${compact ? "text-[10px]" : "text-xs"} text-rose-700`}
          >
            Ends
          </div>
          <div
            className={`font-bold whitespace-nowrap ${
              -compact
                ? "text-sm"
                : "text-xl" + compact
                  ? "text-base"
                  : "text-lg"
            } text-rose-800`}
          >
            {to12Hour(end)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuqatusCards({ slots = [], variant = "full" }) {
  const compact = variant === "compact";

  return (
    <div
      className={`
        grid gap-3
        ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}
      `}
    >
      {slots.map((s, idx) => (
        <PrayerCard
          key={`${s.label}-${idx}`}
          title={s.label}
          start={s.start}
          end={s.end}
          isCurrent={s.highlight}
          compact={compact}
        />
      ))}
    </div>
  );
}
