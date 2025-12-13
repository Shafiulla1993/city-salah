// src/lib/search/searchPresets.js

export const SEARCH_PRESETS = {
  // Public masjid search
  MASJID_PUBLIC: [
    "name",
    "areaName",
    "cityName",
  ],

  // Admin masjid search
  MASJID_ADMIN: [
    "name",
    "slug",
    (m) => `${m.area?.name} ${m.city?.name}`,
  ],

  AREA_ADMIN: [
    "name",
    (a) => a.city?.name,
  ],

  CITY_ADMIN: ["name"],

  USER_ADMIN: [
    "name",
    "email",
    "phone",
    "role",
  ],
};
