// src/lib/api/public.ja

import { httpFetch } from "../http/fetchClient";

const BASE = "/public";

export const publicAPI = {
  /** -----------------ALL CITIES ----------------- **/
  getCities: () => httpFetch(`${BASE}/cities`),

  /** -----------------ALL CITIES ----------------- **/
  getCity: (cityId) => httpFetch(`${BASE}/cities/${cityId}`),

  /** ----------------- AREAS ----------------- **/
  getAreas: (cityId) => httpFetch(`${BASE}/areas?cityId=${cityId}`),

  /** ----------------- MASJIDS ----------------- **/
  getMasjids: ({ cityId, areaId, search }) => {
    const params = new URLSearchParams();
    if (cityId) params.append("cityId", cityId);
    if (areaId) params.append("areaId", areaId);
    if (search) params.append("search", search);

    return httpFetch(`${BASE}/masjids?${params.toString()}`);
  },

  /** ----------------- NEAREST ----------------- **/
  getNearestMasjids: ({ lat, lng, limit = 5 }) =>
    httpFetch(`${BASE}/masjids/nearest?lat=${lat}&lng=${lng}&limit=${limit}`),

  /** ---------------- MASJID BY ID ---------------- **/
  getMasjidById: (id) => httpFetch(`${BASE}/masjids/${id}`),

  /** ---------------- PRAYER TIMINGS ---------------- **/
  getPrayerTimings: (masjidId) =>
    httpFetch(`${BASE}/timings?masjidId=${masjidId}`),

  /** ---------------- CONTACTS ---------------- **/
  getContacts: (masjidId) => httpFetch(`${BASE}/masjids/${masjidId}`),

  /** ---------------- ANNOUNCEMENTS ---------------- **/
  getGeneralAnnouncements: ({ cityId, areaId, masjidId } = {}) => {
    const params = new URLSearchParams();
    if (masjidId) params.append("masjidId", masjidId);
    else if (areaId) params.append("areaId", areaId);
    else if (cityId) params.append("cityId", cityId);

    return httpFetch(
      `${BASE}/general-announcements${
        params.toString() ? `?${params.toString()}` : ""
      }`
    ).catch(() => []);
  },

  getMasjidAnnouncements: (masjidId) =>
    httpFetch(`${BASE}/masjid-announcements?masjidId=${masjidId}`),

  /** ---------------- THOUGHT OF DAY ---------------- **/
  getThoughtOfDay: () => httpFetch(`${BASE}/thought-of-day`).catch(() => []),

  /** ---------------- General Prayer Timings ---------------- **/
  getGeneralTimings: ({ cityId, areaId, date }) => {
    const params = new URLSearchParams();
    if (cityId) params.append("cityId", cityId);
    if (areaId) params.append("areaId", areaId);
    if (date) params.append("date", date);
    return httpFetch(`/public/general-timings?${params.toString()}`);
  },
};
