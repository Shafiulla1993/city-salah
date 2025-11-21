// src/lib/prayer/generatePrayerTimes.js

import {
  PrayerTimes,
  CalculationMethod,
  Coordinates,
  Madhab,
} from "adhan";

import moment from "moment-timezone";

/**
 * Generate daily prayer times using Adhan
 */
export function generatePrayerTimes({
  latitude,
  longitude,
  timezone = "Asia/Kolkata",
  madhab = "shafi",
  offsets = {},
}) {
  const date = new Date();
  const coords = new Coordinates(latitude, longitude);

  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  const times = new PrayerTimes(coords, date, params);

  const format = (t) => moment(t).tz(timezone).format("HH:mm");
  const applyOffset = (t, offset = 0) =>
    moment(t).add(offset, "minutes").tz(timezone).format("HH:mm");

  const base = {
    fajr: applyOffset(times.fajr, offsets.fajr || 0),
    sunrise: applyOffset(times.sunrise, offsets.sunrise || 0),
    dhuhr: applyOffset(times.dhuhr, offsets.dhuhr || 0),
    asr: applyOffset(times.asr, offsets.asr || 0),
    maghrib: applyOffset(times.maghrib, offsets.maghrib || 0),
    isha: applyOffset(times.isha, offsets.isha || 0),
  };

  // Extra derived times
  const sehri = moment(times.fajr)
    .subtract(10, "minutes")
    .tz(timezone)
    .format("HH:mm");

  const ishraq = moment(times.sunrise)
    .add(15, "minutes")
    .tz(timezone)
    .format("HH:mm");

  const makrooh = moment(times.maghrib)
    .subtract(15, "minutes")
    .tz(timezone)
    .format("HH:mm");

  const prayers = [
    { name: "Sehri", startTime: "00:00", endTime: sehri },
    { name: "Fajr", startTime: base.fajr, endTime: base.sunrise },
    { name: "Sunrise", startTime: base.sunrise, endTime: ishraq },
    { name: "Ishraq", startTime: ishraq, endTime: base.dhuhr },
    { name: "Dhuhr", startTime: base.dhuhr, endTime: base.asr },
    { name: "Asr", startTime: base.asr, endTime: makrooh },
    { name: "Makrooh", startTime: makrooh, endTime: base.maghrib },
    { name: "Maghrib", startTime: base.maghrib, endTime: base.isha },
    { name: "Isha", startTime: base.isha, endTime: "23:59" },
  ];

  return {
    date: moment(date).tz(timezone).format("YYYY-MM-DD"),
    prayers,
  };
}

/**
 * Generate both Hanafi & Shafi timings
 */
export function generateBothMadhabs(options) {
  const shafi = generatePrayerTimes({ ...options, madhab: "shafi" });
  const hanafi = generatePrayerTimes({ ...options, madhab: "hanafi" });

  return { shafi, hanafi };
}
