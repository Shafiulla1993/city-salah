// src/store/useMasjidStore.js

import { create } from "zustand";
import { publicAPI } from "@/lib/api/public";

export const useMasjidStore = create((set, get) => ({
  /* ---------------- STATE ---------------- */
  selectedCity: "",
  selectedArea: "",
  selectedMasjid: null,

  initialized: false,
  initializing: true,
  loadingLocation: false,

  userHasManualSelection: false, // user clicked city/area/masjid manually
  urlHydrated: false,            // SEO city/area hydration
  gpsDetected: false,            // 🔑 GPS intent (AREA MODE, not single)

  /* ---------------- SETTERS ---------------- */

  /**
   * Used ONLY for /masjid/[slug]
   * Must NOT block GPS permanently
   * Must preserve single-masjid mode
   */
  setContextFromMasjid: (masjid) => {
    set({
      selectedCity: masjid.city?._id || "",
      selectedArea: masjid.area?._id || "",
      selectedMasjid: masjid,
      gpsDetected: false,        // ❗ ensure single mode
      userHasManualSelection: true,
      urlHydrated: false,
    });
  },

  /**
   * Normal city selection (AREA MODE)
   */
  setCity: (cityId) => {
    set({
      selectedCity: cityId,
      selectedArea: "",
      selectedMasjid: null,
      gpsDetected: false,
      userHasManualSelection: true,
      urlHydrated: false,
    });
    localStorage.setItem("selectedCityId", cityId);
  },

  /**
   * Normal area selection (AREA MODE)
   */
  setArea: (areaId) => {
    set({
      selectedArea: areaId,
      selectedMasjid: null,
      gpsDetected: false,
      userHasManualSelection: true,
      urlHydrated: false,
    });
    localStorage.setItem("selectedAreaId", areaId);
  },

  /**
   * Explicit masjid click from UI (SINGLE MODE)
   */
  setMasjid: (masjid) => {
    set({
      selectedMasjid: masjid,
      gpsDetected: false,
      userHasManualSelection: true,
      urlHydrated: false,
    });
    if (masjid?._id) {
      localStorage.setItem("selectedMasjidId", masjid._id);
    }
  },

  /* ---------------- INIT ---------------- */
  init: async () => {
    const { initialized } = get();
    if (initialized) return;

    set({ initialized: true, initializing: true });

    /* ---------- 1️⃣ SEO URL HYDRATION (city/area only) ---------- */
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const citySlug = params.get("city");
      const areaSlug = params.get("area");

      if (citySlug) {
        try {
          set({ urlHydrated: true });

          const cities = await publicAPI.getCities();
          const city = cities.find((c) => c.slug === citySlug);

          if (city) {
            set({
              selectedCity: city._id,
              selectedArea: "",
              selectedMasjid: null,
              gpsDetected: false,
            });
            localStorage.setItem("selectedCityId", city._id);

            if (areaSlug) {
              const areas = await publicAPI.getAreas(city._id);
              const area = areas.find(
                (a) =>
                  a.name.toLowerCase().replace(/\s+/g, "-") === areaSlug
              );

              if (area) {
                set({
                  selectedArea: area._id,
                  selectedMasjid: null,
                  gpsDetected: false,
                });
                localStorage.setItem("selectedAreaId", area._id);
              }
            }
          }

          set({ initializing: false });
          return; // ⛔ SEO wins → NO GPS
        } catch (err) {
          console.error("SEO hydration failed", err);
        }
      }
    }

    /* ---------- 2️⃣ GPS DETECTION ---------- */
    const { userHasManualSelection, urlHydrated } = get();
    if (userHasManualSelection || urlHydrated) {
      set({ initializing: false });
      return;
    }

    if (!navigator.geolocation) {
      set({ initializing: false });
      return;
    }

    set({ loadingLocation: true });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearest = await publicAPI.getNearestMasjids({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            limit: 1,
          });

          if (!nearest?.length) return;

          const m = nearest[0];
          const full = await publicAPI.getMasjidById(m._id);

          set({
            selectedCity: m.city?._id || m.city,
            selectedArea: m.area?._id || m.area,
            selectedMasjid: full,   // highlight nearest
            gpsDetected: true,      // 🔑 AREA MODE
          });

          localStorage.setItem("selectedCityId", m.city?._id || m.city);
          localStorage.setItem("selectedAreaId", m.area?._id || m.area);
          localStorage.setItem("selectedMasjidId", m._id);
        } catch (err) {
          console.error("GPS detection failed", err);
        } finally {
          set({ loadingLocation: false, initializing: false });
        }
      },
      () => {
        set({ loadingLocation: false, initializing: false });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },
}));
