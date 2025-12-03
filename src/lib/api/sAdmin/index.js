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
  getCities: (query = "") => httpFetch(`/super-admin/cities${query}`),
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

  /** ------------------- GENERAL PRAYER TIMINGS (TEMPLATES) ------------------- **/
  getTimingTemplates: () =>
    httpFetch(`/super-admin/general-prayer-timings/templates`),

  createTimingTemplate: (data) =>
    send(`/super-admin/general-prayer-timings/templates`, "POST", data),

  updateTimingTemplate: (id, data) =>
    send(`/super-admin/general-prayer-timings/templates/${id}`, "PUT", data),

  deleteTimingTemplate: (id) =>
    httpFetch(`/super-admin/general-prayer-timings/templates/${id}`, {
      method: "DELETE",
    }),

  /** Upload CSV (full year import) */
  uploadTimingTemplateCSV: (data) =>
    send(`/super-admin/general-prayer-timings/templates`, "POST", data), // same route as createTemplate — backend auto detects CSV

  /** ------------------- GENERAL PRAYER TIMINGS (MAPPINGS) ------------------- **/
  getTimingMappings: () =>
    httpFetch(`/super-admin/general-prayer-timings/mappings`),

  createTimingMapping: (data) =>
    send(`/super-admin/general-prayer-timings/mappings`, "POST", data),

  deleteTimingMapping: (id) =>
    httpFetch(`/super-admin/general-prayer-timings/mappings/${id}`, {
      method: "DELETE",
    }),

  /** ------------------- GENERAL PRAYER TIMINGS (MANUAL) ------------------- **/
  createManualGeneralTiming: (data) =>
    send(`/super-admin/general-prayer-timings/manual`, "POST", data),

  getGeneralTimingByDate: ({ cityId, areaId, date }) =>
    httpFetch(
      `/super-admin/general-prayer-timings/by-date?city=${cityId}&area=${areaId}&date=${date}`
    ),
};
