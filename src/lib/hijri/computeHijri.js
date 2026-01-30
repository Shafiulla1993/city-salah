// src/lib/hijri/computeHijri.js
// Civil Hijri (Kuwaiti algorithm) – stable & widely used
export function computeHijri(inputDate = new Date(), offset = 0) {
  const date = new Date(inputDate);
  date.setDate(date.getDate() + offset);

  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  let m = month + 1;
  let y = year;

  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const r = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - r) / 5316) * Math.floor((50 * r) / 17719) +
    Math.floor(r / 5670) * Math.floor((43 * r) / 15238);

  const r2 =
    r -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;

  const hijriMonth = Math.floor((24 * r2) / 709);
  const hijriDay = r2 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const monthNames = [
    "Muharram",
    "Safar",
    "Rabi al-Awwal",
    "Rabi al-Thani",
    "Jumada al-Ula",
    "Jumada al-Thani",
    "Rajab",
    "Sha‘ban",
    "Ramadan",
    "Shawwal",
    "Dhul Qa‘dah",
    "Dhul Hijjah",
  ];

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    monthName: monthNames[hijriMonth - 1],
    iso: `${hijriYear}-${String(hijriMonth).padStart(2, "0")}-${String(
      hijriDay,
    ).padStart(2, "0")}`,
  };
}
