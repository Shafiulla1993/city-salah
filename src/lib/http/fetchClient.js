// src/lib/http/fetchClient

const BASE_URL = "/api";

export async function httpFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const config = {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  };

  const res = await fetch(BASE_URL + url, config);

  let data = {};
  try {
    data = await res.json();
  } catch {}

  // IMPORTANT: never redirect from here
  if (res.status === 401) {
    return { loggedIn: false };
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
