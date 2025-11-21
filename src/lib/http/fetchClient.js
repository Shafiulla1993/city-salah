// src/lib/http/clientFetch.js

let isRefreshing = false;
let refreshQueue = [];

const BASE_URL = "/api";

/**
 * Add failed requests to queue until refresh completes
 */
function addToQueue(callback) {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject, callback });
  });
}

/**
 * Resolve queued requests
 */
function processQueue(error, token = null) {
  refreshQueue.forEach((req) => {
    if (error) req.reject(error);
    else req.resolve(req.callback(token));
  });
  refreshQueue = [];
}

/**
 * MAIN HTTP CLIENT (cookies + optional access token)
 */
export async function httpFetch(url, options = {}) {
  const config = {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  try {
    let res = await fetch(BASE_URL + url, config);

    // -----------------------------
    // SUCCESS
    // -----------------------------
    if (res.ok) return await res.json();

    // -----------------------------
    // 401 HANDLING (TOKEN EXPIRED)
    // -----------------------------
    if (res.status === 401) {
      // 👉 IMPORTANT: DO NOT REFRESH FOR LOGIN
      if (url.includes("/auth/login")) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid credentials");
      }

      // Queue request if another refresh is running
      if (isRefreshing) {
        return addToQueue((newToken) =>
          httpFetch(url, {
            ...options,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          })
        );
      }

      // BEGIN REFRESH
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const data = await refreshRes.json();
        const newToken = data?.accessToken;

        if (!newToken) throw new Error("No new access token");

        // Process waiting requests
        processQueue(null, newToken);

        // Retry original request
        return httpFetch(url, {
          ...options,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (err) {
        // Refresh failed → fail queued requests & logout
        processQueue(err, null);

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // -----------------------------
    // OTHER ERRORS
    // -----------------------------
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Request failed");
  } catch (err) {
    console.error("httpFetch Error:", err);
    throw err;
  }
}
