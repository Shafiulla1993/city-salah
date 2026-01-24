// src/components/masjid/MasjidDetailsLayout.js

"use client";

import dynamic from "next/dynamic";
import usePrayerCountdown, {
  getPrevAndNextIqaamats,
} from "@/hooks/usePrayerCountdown";
import { useMasjidStore } from "@/store/useMasjidStore";

const AuqatusCards = dynamic(
  () => import("@/components/auqatus/AuqatusCards"),
  { ssr: false },
);

/* ---------------- UI helpers ---------------- */

function GlassCard({ children }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl p-4">
      {children}
    </div>
  );
}

function ContactCard({ title, contact }) {
  if (!contact) return null;

  return (
    <div className="rounded-xl bg-white border px-3 py-2 text-sm">
      <div className="font-bold text-slate-900">{title}</div>
      <div className="text-slate-700 truncate">{contact.name || "--"}</div>
      {contact.phone && (
        <a
          href={`tel:${contact.phone}`}
          className="text-emerald-600 font-medium"
        >
          {contact.phone}
        </a>
      )}
    </div>
  );
}

function SmallPrayerCard({ title, azan, iqaamat }) {
  return (
    <div className="rounded-xl border px-3 py-2 text-sm bg-white">
      <div className="font-bold text-slate-900">{title}</div>
      <div className="text-slate-700 whitespace-nowrap">
        Azaan: {azan || "--"}
      </div>
      <div className="text-slate-700 whitespace-nowrap">
        Iqaamat: {iqaamat || "--"}
      </div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export default function MasjidDetailsLayout({
  masjid,
  masjidTimings,
  generalTimings,
}) {
  const { detectMyLocation, loadingLocation } = useMasjidStore();

  const { next, prev } = masjidTimings
    ? getPrevAndNextIqaamats(masjidTimings)
    : {};

  const { remainingStr, progress } = usePrayerCountdown(next?.time, prev?.time);

  const contacts = masjid?.contacts || [];
  const imam = contacts.find((c) => c.role === "imam");
  const mozin = contacts.find((c) => c.role === "mozin");
  const mutawalli = contacts.find((c) => c.role === "mutawalli");

  const coords = masjid?.location?.coordinates;
  const lat = coords?.[1];
  const lng = coords?.[0];
  

  return (
    <div className="mx-auto max-w-7xl pt-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            {masjid.name}
          </h1>
          <h2 className="text-base font-semibold text-white mt-1 drop-shadow">
            Masjid in {masjid.area?.name}, {masjid.city?.name} – Prayer Timings & Location
          </h2>

        </div>

        <button
          onClick={detectMyLocation}
          disabled={loadingLocation}
          className="mt-2 text-sm px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold shadow-md"
        >
          {loadingLocation ? "Detecting..." : "📍 Detect My Location"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <GlassCard>
            <div className="w-full aspect-[4/5] bg-slate-200 rounded-xl overflow-hidden">
              <img
                src={masjid.imageUrl || "/Default_Image.png"}
                alt={`${masjid.name} Masjid in ${masjid.area?.name}, ${masjid.city?.name}`}
                className="w-full h-full object-contain"
              />
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-bold mb-1">
              Address of {masjid.name} Masjid, {masjid.area?.name}
            </h3>

            <p className="text-sm text-slate-700">{masjid.address || "--"}</p>

            {lat && lng && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                className="inline-block mt-2 text-sm font-semibold text-emerald-700 underline"
              >
                Open in Google Maps
              </a>
            )}
          </GlassCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* NEXT PRAYER */}
          {next && (
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">Next Prayer</div>
                  <div className="text-xl font-bold uppercase">{next.name}</div>
                  <div className="text-slate-700 whitespace-nowrap">
                    {next.timeStr}
                  </div>
                </div>

                {/* Countdown Ring */}
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
                      strokeDashoffset={2 * Math.PI * 42 * (1 - progress)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-center leading-tight">
                    {remainingStr}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* MASJID PRAYER TIMINGS */}
          {masjidTimings && (
            <GlassCard>
              <h3 className="font-bold mb-3">Masjid Prayer Timings</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SmallPrayerCard title="Fajr" {...masjidTimings.fajr} />
                <SmallPrayerCard title="Zohar" {...masjidTimings.zohar} />
                <SmallPrayerCard title="Asr" {...masjidTimings.asr} />
                <SmallPrayerCard title="Maghrib" {...masjidTimings.maghrib} />
                <SmallPrayerCard title="Isha" {...masjidTimings.isha} />
                <SmallPrayerCard title="Juma" {...masjidTimings.juma} />
              </div>
            </GlassCard>
          )}

          {/* CONTACTS */}
          {(imam || mozin || mutawalli) && (
            <GlassCard>
              <h3 className="font-bold mb-3">Masjid Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ContactCard title="Imam" contact={imam} />
                <ContactCard title="Mozin" contact={mozin} />
                <ContactCard title="Zimmedar" contact={mutawalli} />
              </div>
            </GlassCard>
          )}

          {/* GENERAL PRAYER TIMINGS (OLD POSITION) */}
          {generalTimings?.length > 0 && (
            <GlassCard>
              <h3 className="font-bold mb-2 text-slate-800">
                Auqatus Salah (Area)
              </h3>
              <AuqatusCards slots={generalTimings} />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
