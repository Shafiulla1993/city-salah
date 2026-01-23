// src/lib/helpers/normalizeTime.js

export function normalizeTime(input, slotName) {
  if (input === null || input === undefined || input === "") return null;

  let hours = 0;
  let minutes = 0;

  const str = String(input).trim();

  // 5, 5.5, 5:30
  if (str.includes(":")) {
    const [h, m] = str.split(":");
    hours = parseInt(h, 10);
    minutes = parseInt(m, 10) || 0;
  } else if (str.includes(".")) {
    const n = parseFloat(str);
    hours = Math.floor(n);
    minutes = Math.round((n - hours) * 60);
  } else {
    hours = parseInt(str, 10);
    minutes = 0;
  }

  if (Number.isNaN(hours)) return null;

  const AM_SLOTS = [
    "sehri_start",
    "sehri_end",
    "fajr_start",
    "fajr_end",
    "makrooh_start",
    "makrooh_end",
    "ishraq_start",
    "ishraq_end",
    "chasht_start",
    "chasht_end",
  ];

  const PM_SLOTS = [
    "zawaal_start",
    "zawaal_end",
    "zohar_start",
    "zohar_end",
    "asar_shafi_start",
    "asar_shafi_end",
    "asar_hanafi_start",
    "asar_hanafi_end",
    "maghrib_start",
    "maghrib_end",
    "isha_start",
  ];

  const NEXTDAY_AM = ["isha_end"];

  let total = hours * 60 + minutes;

  if (PM_SLOTS.includes(slotName) && hours < 12) {
    total += 12 * 60;
  }

  if (NEXTDAY_AM.includes(slotName)) {
    // stays AM but is logically next day, still store minutes 0–720
    total = hours * 60 + minutes;
  }

  return total; // always minutes
}
