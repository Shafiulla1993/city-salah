// src/lib/api/sAdmin/index.js

import { httpFetch } from "@/lib/http/fetchClient";

const BASE = "";

/**
 * Smart wrapper — sends FormData OR JSON automatically
 */
function send(url, method, data) {
  const isForm = data instanceof FormData;

  return httpFetch(`${BASE}${url}`, {
    method,
    body: isForm ? data : JSON.stringify(data),
  });
}

export const adminAPI = {
  /** ------------------- DASHBOARD ------------------- **/
  getDashboard: () => httpFetch(`/super-admin/dashboard`),

  /** ------------------- USERS ------------------- **/
  getUsers: (query = "") => httpFetch(`/super-admin/users${query}`),
  getUserById: (id) => httpFetch(`/super-admin/users/${id}`),
  createUser: (data) => send(`/super-admin/users`, "POST", data),
  updateUser: (id, data) => send(`/super-admin/users/${id}`, "PUT", data),
  deleteUser: (id) =>
    httpFetch(`/super-admin/users/${id}`, { method: "DELETE" }),

  /** ------------------- CITIES ------------------- **/
  getCities: () => httpFetch(`/super-admin/cities`),
  getCityById: (id) => httpFetch(`/super-admin/cities/${id}`),
  createCity: (data) => send(`/super-admin/cities`, "POST", data),
  updateCity: (id, data) => send(`/super-admin/cities/${id}`, "PUT", data),
  checkCityDeleteSafe: (id) =>
    httpFetch(`/super-admin/cities/${id}/can-delete`),
  deleteCity: (id) =>
    httpFetch(`/super-admin/cities/${id}`, { method: "DELETE" }),

  /** ------------------- AREAS ------------------- **/
  getAreas: (query = "") => httpFetch(`/super-admin/areas${query}`),
  getAreaById: (id) => httpFetch(`/super-admin/areas/${id}`),
  createArea: (data) => send(`/super-admin/areas`, "POST", data),
  updateArea: (id, data) => send(`/super-admin/areas/${id}`, "PUT", data),
  deleteArea: (id) =>
    httpFetch(`/super-admin/areas/${id}`, { method: "DELETE" }),
  checkAreaDeleteSafe: (id) => httpFetch(`/super-admin/areas/${id}/can-delete`),

  /** ------------------- MASJIDS ------------------- **/
  getMasjids: (query = "") => httpFetch(`/super-admin/masjids${query}`),
  getMasjidById: (id) => httpFetch(`/super-admin/masjids/${id}`),
  createMasjid: (data) => send(`/super-admin/masjids`, "POST", data), // supports FormData
  updateMasjid: (id, data) => send(`/super-admin/masjids/${id}`, "PUT", data),
  deleteMasjid: (id) =>
    httpFetch(`/super-admin/masjids/${id}`, { method: "DELETE" }),

  /** ------------------- ANNOUNCEMENTS ------------------- **/
  getAnnouncements: () => httpFetch(`/super-admin/general-announcements`),
  getAnnouncementById: (id) =>
    httpFetch(`/super-admin/general-announcements/${id}`),

  createAnnouncement: (data) =>
    send(`/super-admin/general-announcements`, "POST", data),

  updateAnnouncement: (id, data) =>
    send(`/super-admin/general-announcements/${id}`, "PUT", data),

  deleteAnnouncement: (id) =>
    httpFetch(`/super-admin/general-announcements/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- THOUGHTS ------------------- **/
  getThoughts: () => httpFetch(`/super-admin/thoughts`),
  getThoughtById: (id) => httpFetch(`/super-admin/thoughts/${id}`),

  createThought: (data) => send(`/super-admin/thoughts`, "POST", data),
  updateThought: (id, data) => send(`/super-admin/thoughts/${id}`, "PUT", data),

  deleteThought: (id) =>
    httpFetch(`/super-admin/thoughts/${id}`, { method: "DELETE" }),

  /** ------------------- PRAYER TIMINGS ------------------- **/
  getTimings: (query = "") => httpFetch(`/super-admin/prayer-timings${query}`),

  getTimingById: (id) => httpFetch(`/super-admin/prayer-timings/${id}`),

  updateTimingOffset: (data) =>
    send(`/super-admin/prayer-timings/update-offsets`, "POST", data),

  updateTimingSlot: (id, data) =>
    send(`/super-admin/prayer-timings/${id}/slot`, "PUT", data),

  generateTimingsRange: (data) =>
    send(`/super-admin/prayer-timings/generate`, "POST", data),
};
