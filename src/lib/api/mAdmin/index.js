// src/lib/api/mAdmin/index.js

import { httpFetch } from "@/lib/http/fetchClient";

const BASE = "";

/**
 * Smart wrapper — JSON or FormData auto handling
 */
function send(url, method, data) {
  const isForm = data instanceof FormData;
  return httpFetch(`${BASE}${url}`, {
    method,
    body: isForm ? data : JSON.stringify(data),
  });
}

export const mAdminAPI = {
  /** ------------------- MASJIDS ------------------- **/
  getMyMasjids: () => httpFetch(`/masjid-admin/masjids`),
  getMasjidById: (id) => httpFetch(`/masjid-admin/masjids/${id}`),

  updateMasjid: (id, formData) =>
    httpFetch(`/masjid-admin/masjids/${id}/update`, {
      method: "PUT",
      body: formData,
    }),

  /** ------------------- ANNOUNCEMENTS ------------------- **/
  getAnnouncements: (masjidId) =>
    httpFetch(`/masjid-admin/masjids/${masjidId}/announcements`),

  /** 🔥 Missing earlier — now added */
  getAnnouncementById: (announcementId) =>
    httpFetch(`/masjid-admin/announcements/${announcementId}`),

  createAnnouncement: (masjidId, data) =>
    send(`/masjid-admin/masjids/${masjidId}/announcements`, "POST", data),

  updateAnnouncement: (announcementId, data) =>
    send(`/masjid-admin/announcements/${announcementId}`, "PATCH", data),

  deleteAnnouncement: (announcementId) =>
    httpFetch(`/masjid-admin/announcements/${announcementId}`, {
      method: "DELETE",
    }),
};
