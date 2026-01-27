// src/components/ramzan/RamzanCards.js

function formatRoza(n) {
  if (n === 1) return "1st Roza";
  if (n === 2) return "2nd Roza";
  if (n === 3) return "3rd Roza";
  return `${n}th Roza`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString("en-IN", { month: "short" });
  return `${day}-${month}`;
}

function isPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d < today;
}

export default function RamzanCards({ days }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {days.map((d, idx) => {
        const past = isPast(d.date);

        return (
          <div
            key={d.dayKey}
            className={`relative bg-white rounded-xl border overflow-hidden shadow-xl ${
              past ? "opacity-60 grayscale" : ""
            }`}
          >
            {/* Diagonal Cross for Completed Roza */}
            {past && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-0 w-[140%] h-[2px] bg-slate-500 rotate-45 origin-top-left" />
              </div>
            )}

            {/* Top Navbar Strip */}
            <div className="flex justify-between items-center px-3 py-2 bg-slate-900 text-white text-lg font-semibold">
              <span>{formatDate(d.date)}</span>
              <span>{formatRoza(idx + 1)}</span>
            </div>

            {/* Body */}
            <div className="p-4 grid grid-cols-2 gap-2">
              {/* Sehri */}
              <div className="text-left">
                <div className="text-sm font-medium text-sky-700">
                  Sehri Ends
                </div>
                <div className="text-2xl font-bold text-sky-900">
                  {d.sehriEndText}
                </div>
              </div>

              {/* Iftar */}
              <div className="text-right">
                <div className="text-sm font-medium text-rose-700">Iftar</div>
                <div className="text-2xl font-bold text-rose-800">
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
