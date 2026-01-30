// src/lib/prayer/prayTimesEngine.js

import PrayTimes from "praytimes";

/* ----------------- Helpers ----------------- */

// "05:23" → minutes from midnight
function toMinutes(t) {
  if (!t || typeof t !== "string") return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// add/subtract minutes safely across midnight
function add(min, offset) {
  if (min === null || min === undefined) return null;
  return (min + offset + 1440) % 1440;
}

/* ----------------- Core ----------------- */

/**
 * Computes Auqatus Salah (general prayer windows)
 * PURE function – no DB, no Hijri, no Ramzan
 */
export function computeAuqatusFromCoords({
  lat,
  lng,
  date = new Date(),
  timezoneOffset, // REQUIRED
  method = "Karachi",
  sehriBuffer = 10,
  ishraqDelay = 10,
  chashtDuration = 120,
}) {
  if (typeof timezoneOffset !== "number") {
    throw new Error("timezoneOffset is required and must be numeric");
  }

  const tz = timezoneOffset;

  const ptShafi = new PrayTimes(method);
  ptShafi.adjust({ asr: 1 });

  const shafi = ptShafi.getTimes(date, [lat, lng], tz);

  const ptHanafi = new PrayTimes(method);
  ptHanafi.adjust({ asr: 2 });

  const hanafi = ptHanafi.getTimes(date, [lat, lng], tz);

  const fajr = toMinutes(shafi.fajr);
  const sunrise = toMinutes(shafi.sunrise);
  const dhuhr = toMinutes(shafi.dhuhr);
  const asrShafi = toMinutes(shafi.asr);
  const asrHanafi = toMinutes(hanafi.asr);
  const maghrib = toMinutes(shafi.maghrib);
  const isha = toMinutes(shafi.isha);

  const sehriEnd = add(fajr, -sehriBuffer);
  const ishraqStart = add(sunrise, ishraqDelay);
  const ishraqEnd = add(ishraqStart, chashtDuration);
  const chashtStart = ishraqEnd;
  const chashtEnd = dhuhr;

  return [
    { name: "sehri_end", time: sehriEnd },

    { name: "fajr_start", time: fajr },
    { name: "fajr_end", time: sunrise },

    { name: "ishraq_start", time: ishraqStart },
    { name: "ishraq_end", time: ishraqEnd },

    { name: "chasht_start", time: chashtStart },
    { name: "chasht_end", time: chashtEnd },

    { name: "zohar_start", time: dhuhr },
    { name: "zohar_end", time: asrHanafi },

    { name: "asar_shafi_start", time: asrShafi },
    { name: "asar_shafi_end", time: maghrib },

    { name: "asar_hanafi_start", time: asrHanafi },
    { name: "asar_hanafi_end", time: maghrib },

    { name: "maghrib_start", time: maghrib },
    { name: "maghrib_end", time: isha },

    { name: "isha_start", time: isha },
    { name: "isha_end", time: fajr }, // next day
  ];
}
