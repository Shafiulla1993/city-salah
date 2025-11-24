// src/lib/api/auth.js

import { httpFetch } from "../http/fetchClient";

const BASE = "/auth";

export const authAPI = {
  login: (data) =>
    httpFetch(`${BASE}/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data) =>
    httpFetch(`${BASE}/register`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    httpFetch(`${BASE}/logout`, {
      method: "POST",
    }),

  updateProfile: (data) =>
    httpFetch(`/auth/update-profile`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  me: () =>
    httpFetch(`${BASE}/me`, {
      method: "GET",
    }),

  refresh: () =>
    httpFetch(`${BASE}/refresh`, {
      method: "GET",
    }),
};
