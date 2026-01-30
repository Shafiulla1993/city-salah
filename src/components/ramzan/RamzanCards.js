// src/components/ramzan/RamzanCards.js

function isToday(dateStr) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d.getTime() === t.getTime();
}

function isPast(dateStr) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return new Date(dateStr) < t;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function RamzanCards({ days }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {days.map((d) => {
        const past = isPast(d.date);
        const today = isToday(d.date);

        return (
          <div
            key={d.dayKey}
            className={`relative rounded-xl border overflow-hidden shadow
              ${today ? "ring-2 ring-emerald-500" : ""}
              ${past ? "opacity-60 grayscale" : "bg-white"}
            `}
          >
            {/* Sticky Roza badge */}
            <div className="absolute top-2 right-2 z-10 bg-slate-900 text-white text-xs px-3 py-1 rounded-full">
              Roza #{d.rozaNumber}
            </div>

            {/* Header */}
            <div className="px-3 py-2 bg-slate-900 text-white font-semibold flex justify-between">
              <span>{formatDate(d.date)}</span>
              {today && <span className="text-emerald-300">Today</span>}
            </div>

            {/* Body */}
            <div className="p-4 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-sky-700">Sehri Ends</div>
                <div className="text-xl font-bold text-sky-900">
                  {d.sehriEndText}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-rose-700">Iftar</div>
                <div className="text-xl font-bold text-rose-800">
                  {d.iftarText}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
