// src/lib/api/sAdmin

import { httpFetch } from "../http/fetchClient";

const BASE = "";

export const adminAPI = {
  /** ------------------- SUPER ADMIN ------------------- **/
  getDashboard: () => httpFetch(`${BASE}/dashboard`),

  getUsers: () => httpFetch(`${BASE}/super-admin/users`),
  getUserById: (id) => httpFetch(`${BASE}/super-admin/users/${id}`),

  updateUser: (id, data) =>
    httpFetch(`${BASE}/super-admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (id) =>
    httpFetch(`${BASE}/super-admin/users/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- CITIES ------------------- **/
  getCities: () => httpFetch(`${BASE}/super-admin/cities`),

  // ✅ ADD THIS
  getCityById: (id) => httpFetch(`${BASE}/super-admin/cities/${id}`),

  createCity: (data) =>
    httpFetch(`${BASE}/super-admin/cities`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCity: (id, data) =>
    httpFetch(`${BASE}/super-admin/cities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCity: (id) =>
    httpFetch(`${BASE}/super-admin/cities/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- AREAS ------------------- **/
  getAreas: () => httpFetch(`${BASE}/super-admin/areas`),

  // ✅ ADD THIS
  getAreaById: (id) => httpFetch(`${BASE}/super-admin/areas/${id}`),

  createArea: (data) =>
    httpFetch(`${BASE}/super-admin/areas`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateArea: (id, data) =>
    httpFetch(`${BASE}/super-admin/areas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteArea: (id) =>
    httpFetch(`${BASE}/super-admin/areas/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- MASJIDS ------------------- **/
  getMasjids: () => httpFetch(`${BASE}/super-admin/masjids`),
  getMasjidById: (id) => httpFetch(`${BASE}/super-admin/masjids/${id}`),

  createMasjid: (data) =>
    httpFetch(`${BASE}/super-admin/masjids`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMasjid: (id, data) =>
    httpFetch(`${BASE}/super-admin/masjids/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMasjid: (id) =>
    httpFetch(`${BASE}/super-admin/masjids/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- ANNOUNCEMENTS ------------------- **/
  getGeneralAnnouncements: () =>
    httpFetch(`${BASE}/super-admin/general-announcements`),

  createGeneralAnnouncement: (data) =>
    httpFetch(`${BASE}/super-admin/general-announcements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateGeneralAnnouncement: (id, data) =>
    httpFetch(`${BASE}/super-admin/general-announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteGeneralAnnouncement: (id) =>
    httpFetch(`${BASE}/super-admin/general-announcements/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- THOUGHT OF DAY ------------------- **/
  getThoughts: () => httpFetch(`${BASE}/super-admin/thought`),

  createThought: (data) =>
    httpFetch(`${BASE}/super-admin/thought`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateThought: (id, data) =>
    httpFetch(`${BASE}/super-admin/thought/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteThought: (id) =>
    httpFetch(`${BASE}/super-admin/thought/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- PRAYER TIMINGS ------------------- **/
  generatePrayerTimings: () =>
    httpFetch(`${BASE}/super-admin/prayer-timings/generate`, {
      method: "POST",
    }),

  updateTimingOffsets: (data) =>
    httpFetch(`${BASE}/super-admin/prayer-timings/update-offsets`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPrayerTimingById: (id) =>
    httpFetch(`${BASE}/super-admin/prayer-timings/${id}`),

  /** ------------------- MASJID ADMIN SECTION ------------------- **/
  getMasjidAdminMasjids: () => httpFetch(`${BASE}/masjid-admin/masjids`),

  getMasjidAdminMasjidById: (id) =>
    httpFetch(`${BASE}/masjid-admin/masjids/${id}`),

  getMasjidAnnouncements: (masjidId) =>
    httpFetch(`${BASE}/masjid-admin/announcements/${masjidId}`),

  createMasjidAnnouncement: (data) =>
    httpFetch(`${BASE}/masjid-admin/announcements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteMasjidAnnouncement: (masjidId) =>
    httpFetch(`${BASE}/masjid-admin/announcements/${masjidId}`, {
      method: "DELETE",
    }),

  getTimingByMasjid: (masjidId) =>
    httpFetch(`${BASE}/masjid-admin/timings/${masjidId}`),
};
