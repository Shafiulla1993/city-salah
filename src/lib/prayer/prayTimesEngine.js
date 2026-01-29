// src/lib/prayer/prayTimesEngine.js

import PrayTimes from "praytimes";

/* ----------------- Helpers ----------------- */

function toMinutes(t) {
  // "05:23" -> minutes from midnight
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function add(min, offset) {
  return (min + offset + 1440) % 1440;
}

/* ----------------- Core ----------------- */

export function computeAuqatusFromCoords({
  lat,
  lng,
  date = new Date(),
  method = "Karachi", // Default for India
  sehriBuffer = 10, // minutes before Fajr
  ishraqDelay = 10, // minutes after Sunrise
  chashtDuration = 120, // Ishraq -> Chasht
}) {
  // Shafi Asr
  const ptShafi = new PrayTimes(method);
  ptShafi.adjust({ asr: 1 }); // Shadow = 1
  const shafiTimes = ptShafi.getTimes(date, [lat, lng], 5.5);

  // Hanafi Asr
  const ptHanafi = new PrayTimes(method);
  ptHanafi.adjust({ asr: 2 }); // Shadow = 2
  const hanafiTimes = ptHanafi.getTimes(date, [lat, lng], 5.5);

  const fajr = toMinutes(shafiTimes.fajr);
  const sunrise = toMinutes(shafiTimes.sunrise);
  const dhuhr = toMinutes(shafiTimes.dhuhr);
  const asrShafi = toMinutes(shafiTimes.asr);
  const asrHanafi = toMinutes(hanafiTimes.asr);
  const maghrib = toMinutes(shafiTimes.maghrib);
  const isha = toMinutes(shafiTimes.isha);

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
    { name: "zohar_end", time: asrShafi },

    { name: "asar_shafi_start", time: asrShafi },
    { name: "asar_shafi_end", time: maghrib },

    { name: "asar_hanafi_start", time: asrHanafi },
    { name: "asar_hanafi_end", time: maghrib },

    { name: "maghrib_start", time: maghrib },
    { name: "maghrib_end", time: isha },

    { name: "isha_start", time: isha },
    { name: "isha_end", time: fajr }, // next day fajr (same as your model)
  ];
}
