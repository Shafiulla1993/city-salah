// src/store/useMasjidStore.js
import { create } from "zustand";

/* -------------------- Helpers -------------------- */

const LS_KEYS = {
  COORDS: "cs_coords",
  CITY: "cs_citySlug",
  AREA: "cs_areaSlug",
  MASJID: "cs_masjidSlug",
  SOURCE: "cs_source",
  RESOLVED_AT: "cs_resolvedAt",
};

function saveCache({ coords, citySlug, areaSlug, masjidSlug, source }) {
  if (coords) localStorage.setItem(LS_KEYS.COORDS, JSON.stringify(coords));
  if (citySlug) localStorage.setItem(LS_KEYS.CITY, citySlug);
  if (areaSlug) localStorage.setItem(LS_KEYS.AREA, areaSlug);
  if (masjidSlug) localStorage.setItem(LS_KEYS.MASJID, masjidSlug);
  if (source) localStorage.setItem(LS_KEYS.SOURCE, source);
  localStorage.setItem(LS_KEYS.RESOLVED_AT, Date.now().toString());
}

function loadCache() {
  try {
    return {
      coords: JSON.parse(localStorage.getItem(LS_KEYS.COORDS) || "null"),
      citySlug: localStorage.getItem(LS_KEYS.CITY) || "",
      areaSlug: localStorage.getItem(LS_KEYS.AREA) || "",
      masjidSlug: localStorage.getItem(LS_KEYS.MASJID) || "",
      source: localStorage.getItem(LS_KEYS.SOURCE) || "none",
      resolvedAt: localStorage.getItem(LS_KEYS.RESOLVED_AT) || null,
    };
  } catch {
    return {};
  }
}

/* -------------------- Store -------------------- */

export const useMasjidStore = create((set, get) => ({
  /* ------------ Canonical Context ------------ */
  city: null,
  area: null,
  masjid: null,

  citySlug: "",
  areaSlug: "",
  masjidSlug: "",

  coords: null, // { lat, lng, accuracy, source: 'gps' }
  source: "none", // url | manual | gps | none
  resolved: false,

  /* ------------ Flags ------------ */
  initialized: false,
  loadingLocation: false,
  gpsAllowed: false,
  userHasManualSelection: false,
  urlHydrated: false,

  /* ------------ Core Resolvers ------------ */

  resolveFromURL: async (citySlug, areaSlug, masjidSlug) => {
    const res = await fetch(
      `/api/public/masjids?mode=by-slug&citySlug=${citySlug}&areaSlug=${areaSlug}&masjidSlug=${masjidSlug}`,
    );
    if (!res.ok) return;

    const data = await res.json();

    set({
      city: data.city,
      area: data.area,
      masjid: data.masjid,
      citySlug,
      areaSlug,
      masjidSlug,
      source: "url",
      resolved: true,
      urlHydrated: true,
    });

    saveCache({ citySlug, areaSlug, masjidSlug, source: "url" });
  },

  resolveFromCoords: async (lat, lng) => {
    const res = await fetch(
      `/api/public/masjids?mode=nearest&lat=${lat}&lng=${lng}`,
    );
    if (!res.ok) return;

    const data = await res.json();

    set({
      city: data.city,
      area: data.area,
      masjid: data.masjid,
      citySlug: data.city.slug,
      areaSlug: data.area.slug,
      masjidSlug: data.masjid.slug,
      coords: { lat, lng, accuracy: null, source: "gps" },
      source: "gps",
      resolved: true,
    });

    saveCache({
      coords: { lat, lng, accuracy: null, source: "gps" },
      citySlug: data.city.slug,
      areaSlug: data.area.slug,
      masjidSlug: data.masjid.slug,
      source: "gps",
    });
  },

  setManualLocation: (masjid) => {
    set({
      city: masjid.city,
      area: masjid.area,
      masjid,
      citySlug: masjid.city.slug,
      areaSlug: masjid.area.slug,
      masjidSlug: masjid.slug,
      source: "manual",
      resolved: true,
      userHasManualSelection: true,
    });

    saveCache({
      citySlug: masjid.city.slug,
      areaSlug: masjid.area.slug,
      masjidSlug: masjid.slug,
      source: "manual",
    });
  },

  /* ------------ Detect My Location (LOCKED) ------------ */

  detectMyLocation: async () => {
    set({ loadingLocation: true });

    if (!navigator.geolocation) {
      set({ loadingLocation: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        set({
          gpsAllowed: true,
          coords: {
            lat,
            lng,
            accuracy: pos.coords.accuracy,
            source: "gps",
          },
        });

        saveCache({
          coords: {
            lat,
            lng,
            accuracy: pos.coords.accuracy,
            source: "gps",
          },
          source: "gps",
        });

        await get().resolveFromCoords(lat, lng);
        set({ loadingLocation: false });
      },
      () => {
        // Permission denied or failed – no fallback (locked)
        set({ loadingLocation: false });
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  },

  /* ------------ GPS Only (No Resolve, No Redirect) ------------ */
  detectMyCoordsOnly: async () => {
    set({ loadingLocation: true });

    if (!navigator.geolocation) {
      set({ loadingLocation: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        set({
          gpsAllowed: true,
          coords: {
            lat,
            lng,
            accuracy: pos.coords.accuracy,
            source: "gps",
          },
        });

        saveCache({
          coords: {
            lat,
            lng,
            accuracy: pos.coords.accuracy,
            source: "gps",
          },
          source: "gps",
        });

        set({ loadingLocation: false });
      },
      () => {
        set({ loadingLocation: false });
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  },

  /* ------------ Init (Runs Once) ------------ */

  init: async (routerParams = {}) => {
    if (get().initialized) return;
    set({ initialized: true });

    const { citySlug, areaSlug, masjidSlug } = routerParams;

    // 1️⃣ Canonical URL wins
    if (citySlug && areaSlug && masjidSlug) {
      await get().resolveFromURL(citySlug, areaSlug, masjidSlug);
      return;
    }

    // 2️⃣ Load cache
    const cache = loadCache();
    if (cache.citySlug && cache.areaSlug && cache.masjidSlug) {
      await get().resolveFromURL(
        cache.citySlug,
        cache.areaSlug,
        cache.masjidSlug,
      );
      set({
        coords: cache.coords,
        source: cache.source || "none",
      });
      return;
    }

    // 3️⃣ Only restore coords, never auto-resolve
    if (cache.coords) {
      set({
        coords: cache.coords,
        source: cache.source || "none",
      });
    }
  },
}));
