// src/components/masjid/MasjidCardBack.js

"use client";

import React, { useEffect } from "react";

/* ---------------- Prayer Card ---------------- */
function PrayerCard({ title, azan, iqaamat }) {
  return (
    <div className="p-3 bg-white rounded-xl border shadow-sm">
      <div className="font-semibold text-slate-800">{title}</div>
      <div className="text-sm text-slate-600">Azaan: {azan || "--"}</div>
      <div className="text-sm text-slate-600">Iqaamat: {iqaamat || "--"}</div>
    </div>
  );
}

/* ---------------- Contact Column ---------------- */
function ContactColumn({ title, contact }) {
  return (
    <div className="p-4">
      <div className="font-semibold text-slate-800 mb-1">{title}</div>
      <div className="text-sm text-slate-700">
        Name: {contact?.name || "--"}
      </div>
      <div className="text-sm text-slate-600">
        Phone: {contact?.phone || "--"}
      </div>
    </div>
  );
}

export default function MasjidCardBack({ masjid }) {
  /* -------------------------------------------------
     🔑 NORMALIZE DATA SOURCE (THIS FIXES YOUR ISSUE)
  -------------------------------------------------- */
  const data = masjid?.fullDetails || masjid;

  const timings = data?.prayerTimings?.[0] || {};
  const contacts = data?.contacts || [];

  const imam = contacts.find((c) => c.role === "imam");
  const mozin = contacts.find((c) => c.role === "mozin");
  const mutawalli = contacts.find((c) => c.role === "mutawalli");

  // coordinates = [lng, lat]
  const lng = data?.location?.coordinates?.[0];
  const lat = data?.location?.coordinates?.[1];

  const mapUrl =
    typeof lat === "number" && typeof lng === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : null;

  /* ---------------- SEO ---------------- */
  useEffect(() => {
    if (data?.name) {
      document.title = `${data.name} – ${data.area?.name}, ${data.city?.name} | Prayer Timings`;
    }
  }, [data]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-white rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg">{data?.name}</div>
        <div className="text-sm text-slate-500 text-right">
          {data?.area?.name}
          <br />
          {data?.city?.name}
        </div>
      </div>

      {/* Prayer Timings */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <PrayerCard
          title="Fajr"
          azan={timings.fajr?.azan}
          iqaamat={timings.fajr?.iqaamat}
        />
        <PrayerCard
          title="Zohar"
          azan={timings.Zohar?.azan}
          iqaamat={timings.Zohar?.iqaamat}
        />
        <PrayerCard
          title="Asr"
          azan={timings.asr?.azan}
          iqaamat={timings.asr?.iqaamat}
        />
        <PrayerCard
          title="Maghrib"
          azan={timings.maghrib?.azan}
          iqaamat={timings.maghrib?.iqaamat}
        />
        <PrayerCard
          title="Isha"
          azan={timings.isha?.azan}
          iqaamat={timings.isha?.iqaamat}
        />
        <PrayerCard
          title="Juma"
          azan={timings.juma?.azan}
          iqaamat={timings.juma?.iqaamat}
        />
      </div>

      {/* Contacts */}
      <div className="mb-6">
        <div className="font-semibold text-slate-800 mb-2">Contacts</div>

        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="grid grid-cols-3 divide-x">
            <ContactColumn title="Imam" contact={imam} />
            <ContactColumn title="Mozin" contact={mozin} />
            <ContactColumn title="Zimmedar" contact={mutawalli} />
          </div>
        </div>
      </div>

      {/* Address + Map */}
      <div className="border rounded-xl bg-white p-4">
        <div className="font-semibold text-slate-800 mb-1">Address</div>

        <div className="text-sm text-slate-700 mb-3">
          {data?.address || "--"}
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
          >
            📍 View on Google Maps
          </a>
        )}
        {data?._id && (
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/api/og/masjid/${data._id}`;

              if (navigator.share) {
                navigator.share({
                  title: `${data.name} Prayer Timings`,
                  text: `Iqaamat timings for ${data.name}`,
                  url: shareUrl,
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert("Masjid prayer timings link copied!");
              }
            }}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
          >
            📤 Share Prayer Timings
          </button>
        )}


      </div>
    </div>
  );
}
