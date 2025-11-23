// src/lib/http/fetchClient

let isRefreshing = false;
let refreshQueue = [];

const BASE_URL = "/api";

/**
 * Queue requests when refresh token in progress
 */
const addToQueue = (cb) =>
  new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject, cb });
  });

const processQueue = (error, token = null) => {
  refreshQueue.forEach((req) => {
    if (error) req.reject(error);
    else req.resolve(req.cb(token));
  });
  refreshQueue = [];
};

/**
 * SMART HTTP CLIENT
 * - Auto JSON / FormData detection
 * - Auto re-auth
 * - Auto-cookie
 * - No-store caching
 */
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

  try {
    let res = await fetch(BASE_URL + url, config);

    if (res.ok) return await safeJson(res);

    // 401 = EXPIRED TOKEN → refresh
    if (res.status === 401) {
      if (url.includes("/auth/login")) {
        const data = await safeJson(res);
        throw new Error(data.message || "Invalid credentials");
      }

      if (isRefreshing) {
        return addToQueue((newToken) =>
          httpFetch(url, attachToken(options, newToken))
        );
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("Refresh failed");

        const data = await safeJson(refreshRes);
        const newToken = data?.accessToken;

        processQueue(null, newToken);

        return httpFetch(url, attachToken(options, newToken));
      } catch (err) {
        processQueue(err, null);

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    const errData = await safeJson(res);
    throw new Error(errData.message || "Request failed");
  } catch (err) {
    console.error("httpFetch Error:", err);
    throw err;
  }
}

/**
 * HELPERS
 */
function attachToken(options, token) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
