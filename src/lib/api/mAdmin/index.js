// src/lib/api/mAdmin/index.js

import { httpFetch } from "@/lib/http/fetchClient";

/**
 * Smart wrapper — same pattern as super-admin
 */
function send(url, method, data = {}) {
  const isForm = data instanceof FormData;

  return httpFetch(url, {
    method,
    headers: isForm
      ? undefined
      : {
          "Content-Type": "application/json",
        },
    body: isForm ? data : JSON.stringify(data),
  });
}

/**
 * Masjid Admin API
 * JSON-first (except upload)
 */
export const mAdminAPI = {
  /* ---------------- MASJIDS ---------------- */

  /** Get masjids assigned to logged-in masjid admin */
  getMyMasjids: () => httpFetch("/masjid-admin/masjids"),

  /** Get single masjid (permission enforced backend) */
  getMasjidById: (id) => httpFetch(`/masjid-admin/masjids/${id}`),

  /**
   * Update masjid (image, contacts, prayerRules)
   * JSON ONLY
   */
  updateMasjid: (id, data) =>
    send(`/masjid-admin/masjids/${id}/update`, "PUT", data),

  /* ---------------- IMAGE ---------------- */

  /** Upload image (ONLY multipart endpoint) */
  uploadMasjidImage: (file) => {
    const fd = new FormData();
    fd.append("image", file);

    return send(`/masjid-admin/masjids/upload-image`, "POST", fd);
  },

  /** Attach / replace image (JSON only) */
  updateMasjidImage: (id, data) =>
    send(`/masjid-admin/masjids/${id}/image`, "PUT", data),

  /** Remove image */
  deleteMasjidImage: (id) =>
    send(`/masjid-admin/masjids/${id}/delete-image`, "POST"),

  /* ---------------- ANNOUNCEMENTS ---------------- */

  getAnnouncements: (masjidId) =>
    httpFetch(`/masjid-admin/masjids/${masjidId}/announcements`),

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
