// src/lib/api/public.js

import { httpFetch } from "../http/fetchClient";

const BASE = "/public";

export const publicAPI = {
  /* =======================
     CITIES
  ======================= */
  getCities: () => httpFetch(`${BASE}/cities`),

  getCity: (cityId) => httpFetch(`${BASE}/cities/${cityId}`),

  /* =======================
     AREAS
  ======================= */
  getAreas: (cityId) => httpFetch(`${BASE}/areas?cityId=${cityId}`),

  /* =======================
     MASJIDS (METADATA ONLY)
  ======================= */
  getMasjids: ({ page = 1, limit = 12, cityId, areaId, search } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (cityId) params.append("cityId", cityId);
    if (areaId) params.append("areaId", areaId);
    if (search) params.append("search", search);

    return httpFetch(`/public/masjids?${params.toString()}`);
  },

  getMasjidById: (idOrSlug) => httpFetch(`${BASE}/masjids/${idOrSlug}`),

  /* =======================
     NEAREST MASJIDS
  ======================= */
  getNearestMasjids: ({ lat, lng, limit = 5 }) =>
    httpFetch(`${BASE}/masjids/nearest?lat=${lat}&lng=${lng}&limit=${limit}`),

  /* =======================
     PRAYER TIMINGS (NEW SOURCE OF TRUTH)
  ======================= */
  getPrayerTimings: (masjidId) =>
    httpFetch(`${BASE}/timings?masjidId=${masjidId}`),

  /* =======================
     Search Masjid
  ======================= */
  getMasjidFeed: ({ page = 1, limit = 12, cityId, areaId } = {}) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (cityId) params.append("cityId", cityId);
    if (areaId) params.append("areaId", areaId);

    return httpFetch(`/public/masjids/feed?${params.toString()}`);
  },

  /* =======================
     ANNOUNCEMENTS
  ======================= */
  getGeneralAnnouncements: ({ cityId, areaId, masjidId } = {}) => {
    const params = new URLSearchParams();
    if (masjidId) params.append("masjidId", masjidId);
    else if (areaId) params.append("areaId", areaId);
    else if (cityId) params.append("cityId", cityId);

    const qs = params.toString();
    return httpFetch(
      `${BASE}/general-announcements${qs ? `?${qs}` : ""}`
    ).catch(() => []);
  },

  getMasjidAnnouncements: (masjidId) =>
    httpFetch(`${BASE}/masjid-announcements?masjidId=${masjidId}`),

  /* =======================
     THOUGHT OF THE DAY
  ======================= */
  getThoughtOfDay: () => httpFetch(`${BASE}/thought-of-day`).catch(() => []),

  /* =======================
     GENERAL (CITY / AREA) TIMINGS
  ======================= */
  getGeneralTimings: ({ cityId, areaId, date } = {}) => {
    const params = new URLSearchParams();
    if (cityId) params.append("cityId", cityId);
    if (areaId) params.append("areaId", areaId);
    if (date) params.append("date", date);

    const qs = params.toString();
    return httpFetch(`${BASE}/general-timings${qs ? `?${qs}` : ""}`);
  },

  /* =======================
     SEARCH INDEX (LIGHTWEIGHT)
  ======================= */
  getAllMasjidIndex: () => httpFetch(`${BASE}/masjids/index`),
};
