// src/components/masjid/MasjidDetailsLayout.js

"use client";

import usePrayerCountdown, {
  getPrevAndNextIqaamats,
} from "@/hooks/usePrayerCountdown";
import { normalizePrayerTimings } from "@/lib/helpers/normalizePrayerTimings";
import AuqatusCards from "@/components/auqatus/AuqatusCards";

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
      <div className="text-slate-700">{contact.name || "--"}</div>
      {contact.phone && (
        <a
          href={`tel:${contact.phone}`}
          className="text-indigo-600 font-medium"
        >
          {contact.phone}
        </a>
      )}
    </div>
  );
}

function SmallPrayerCard({ title, azan, iqaamat, highlight }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm ${
        highlight
          ? "bg-emerald-100 border-emerald-400"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="font-bold text-slate-900">{title}</div>
      <div className="text-slate-700">Azaan: {azan || "--"}</div>
      <div className="text-slate-700">Iqaamat: {iqaamat || "--"}</div>
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export default function MasjidDetailsLayout({
  masjid,
  masjidTimings,
  generalTimings,
}) {
  const normalizedMasjidTimings = masjidTimings
    ? normalizePrayerTimings(masjidTimings)
    : null;

  const { next, prev } = normalizedMasjidTimings
    ? getPrevAndNextIqaamats(normalizedMasjidTimings)
    : {};

  const { remainingStr, progress } = usePrayerCountdown(next?.time, prev?.time);

  const contacts = masjid?.contacts || [];
  const imam = contacts.find((c) => c.role === "imam");
  const mozin = contacts.find((c) => c.role === "mozin");
  const mutawalli = contacts.find((c) => c.role === "mutawalli");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* IMAGE + META */}
          <GlassCard>
            <div className="w-full aspect-[4/5] bg-slate-200 rounded-xl flex items-center justify-center">
              <img
                src={masjid.imageUrl || "/Default_Image.png"}
                alt={masjid.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-bold">{masjid.name}</h2>
              <p className="text-sm text-slate-600">
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
          </GlassCard>

          {/* ADDRESS */}
          <GlassCard>
            <h3 className="font-bold mb-1">Address</h3>
            <p className="text-sm text-slate-700">{masjid.address || "--"}</p>
          </GlassCard>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* NEXT PRAYER */}
          {next && (
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">Next Prayer</div>
                  <div className="text-xl font-bold uppercase">{next.name}</div>
                  <div className="text-slate-700">{next.timeStr}</div>
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
                      strokeDashoffset={2 * Math.PI * 42 * (1 - progress)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {remainingStr}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* MASJID PRAYER TIMINGS */}
          {normalizedMasjidTimings && (
            <GlassCard>
              <h3 className="font-bold mb-3">Masjid Prayer Timings</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SmallPrayerCard
                  title="Fajr"
                  {...normalizedMasjidTimings.fajr}
                  highlight={next?.name === "Fajr"}
                />

                <SmallPrayerCard
                  title="Zohar"
                  {...normalizedMasjidTimings.zohar}
                  highlight={next?.name === "Zohar"}
                />

                <SmallPrayerCard
                  title="Asr"
                  {...normalizedMasjidTimings.asr}
                  highlight={next?.name === "Asr"}
                />

                <SmallPrayerCard
                  title="Maghrib"
                  {...normalizedMasjidTimings.maghrib}
                  highlight={next?.name === "Maghrib"}
                />

                <SmallPrayerCard
                  title="Isha"
                  {...normalizedMasjidTimings.isha}
                  highlight={next?.name === "Isha"}
                />

                <SmallPrayerCard
                  title="Juma"
                  {...normalizedMasjidTimings.juma}
                  highlight={next?.name === "Juma"}
                />
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

          {/* AUQATUS SALAH */}
          {generalTimings?.length > 0 && (
            <GlassCard>
              <h3 className="font-bold mb-3">Auqatus Salah (Area)</h3>
              <AuqatusCards slots={generalTimings} />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
