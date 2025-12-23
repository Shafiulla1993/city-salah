// src/components/masjid/MasjidDetails.js

"use client";

import usePrayerCountdown, {
  getPrevAndNextIqaamats,
} from "@/hooks/usePrayerCountdown";
import { normalizePrayerTimings } from "@/lib/helpers/normalizePrayerTimings";

/* ---------- Small UI blocks ---------- */

function Card({ children }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl overflow-hidden">
      {children}
    </div>
  );
}

function PrayerCard({ title, azan, iqaamat }) {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-slate-600">Azaan: {azan || "--"}</div>
      <div className="text-xs text-slate-600">Iqaamat: {iqaamat || "--"}</div>
    </div>
  );
}

function ContactBlock({ title, contact }) {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs">{contact?.name || "--"}</div>
      <div className="text-xs text-slate-600">{contact?.phone || "--"}</div>
    </div>
  );
}

/* ---------- MAIN ---------- */

export default function MasjidDetails({ masjid }) {
  const raw = masjid?.prayerTimings?.[0] || {};
  const timings = normalizePrayerTimings(raw);

  const { next, prev } = getPrevAndNextIqaamats(timings);
  const { remainingStr, progress } = usePrayerCountdown(next?.time, prev?.time);

  const safeProgress = Number.isFinite(progress) ? progress : 0;

  const contacts = masjid?.contacts || [];
  const imam = contacts.find((c) => c.role === "imam");
  const mozin = contacts.find((c) => c.role === "mozin");
  const mutawalli = contacts.find((c) => c.role === "mutawalli");

  return (
    <>
      {/* HERO */}
      <Card>
        <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl p-4">
          <div className="w-full aspect-[4/5] bg-black/5 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={masjid.imageUrl || "/Default_Image.png"}
              alt={masjid.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="p-5">
          <h2 className="text-2xl font-bold">{masjid.name}</h2>
          <p className="text-slate-600">
            {masjid.area?.name}, {masjid.city?.name}
          </p>

          <div className="mt-2 text-sm font-medium">
            {masjid.ladiesPrayerFacility ? (
              <span className="text-emerald-700">
                ✓ Ladies Prayer Available
              </span>
            ) : (
              <span className="text-rose-700">
                ✗ Ladies Prayer Not Available
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* NEXT PRAYER */}
      <Card>
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600">Next Prayer</div>
            <div className="text-xl font-bold uppercase">
              {next?.name || "--"}
            </div>
            <div className="text-slate-700">{next?.timeStr || "--:--"}</div>
          </div>

          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="-rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#16a34a"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - safeProgress)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {remainingStr}
            </div>
          </div>
        </div>
      </Card>

      {/* PRAYER TIMINGS */}
      <Card>
        <div className="p-6">
          <h3 className="font-bold mb-4">Prayer Timings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <PrayerCard title="Fajr" {...timings.fajr} />
            <PrayerCard title="Zohar" {...timings.zohar} />
            <PrayerCard title="Asr" {...timings.asr} />
            <PrayerCard title="Maghrib" {...timings.maghrib} />
            <PrayerCard title="Isha" {...timings.isha} />
            <PrayerCard title="Juma" {...timings.juma} />
          </div>
        </div>
      </Card>

      {/* ADDRESS */}
      <Card>
        <div className="p-6">
          <h3 className="font-bold mb-2">Address</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {masjid.address || "--"}
          </p>
        </div>
      </Card>

      {/* CONTACTS */}
      <Card>
        <div className="p-6">
          <h3 className="font-bold mb-4">Contacts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ContactBlock title="Imam" contact={imam} />
            <ContactBlock title="Mozin" contact={mozin} />
            <ContactBlock title="Secretary" contact={mutawalli} />
          </div>
        </div>
      </Card>
    </>
  );
}
