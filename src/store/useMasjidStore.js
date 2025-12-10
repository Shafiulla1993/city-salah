// src/store/useMasjidStore.js

import { create } from "zustand";
import { publicAPI } from "@/lib/api/public";

/* Detect manual browser refresh */
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("__MANUAL_REFRESH__", "true");
  });
}

export const useMasjidStore = create((set, get) => ({
  selectedCity: "",
  selectedArea: "",
  selectedMasjid: null,

  initialized: false,
  loadingLocation: false,
  initializing: true, // 🔵 NEW
  userHasManualSelection: false,

  setInitializing: (v) => set({ initializing: v }), // 🔵 NEW

  /* ---------- MANUAL SETTERS ---------- */
  setCity: (cityId) => {
    set({
      selectedCity: cityId,
      selectedArea: "",
      selectedMasjid: null,
      userHasManualSelection: true,
    });
    localStorage.setItem("selectedCityId", cityId);
  },

  setArea: (areaId) => {
    set({
      selectedArea: areaId,
      selectedMasjid: null,
      userHasManualSelection: true,
    });
    localStorage.setItem("selectedAreaId", areaId);
  },

  setMasjid: (masjid) => {
    set({
      selectedMasjid: masjid,
      userHasManualSelection: true,
    });
    if (masjid?._id) localStorage.setItem("selectedMasjidId", masjid._id);
  },

  /* ---------- INIT ---------- */
  init: async () => {
    const { initialized, userHasManualSelection } = get();
    if (initialized) return;

    set({ initialized: true, initializing: true });

    const fallbackToSaved = async () => {
      const savedMasjidId = localStorage.getItem("selectedMasjidId");
      if (!savedMasjidId) return;

      try {
        const m = await publicAPI.getMasjidById(savedMasjidId);
        set({
          selectedCity: m.city?._id || m.city,
          selectedArea: m.area?._id || m.area,
          selectedMasjid: m,
        });
      } catch (err) {
        console.error("Fallback saved masjid error", err);
      }
    };

    // Detect refresh reliably
    const wasRefresh = sessionStorage.getItem("__MANUAL_REFRESH__") === "true";
    if (wasRefresh) {
      sessionStorage.removeItem("__MANUAL_REFRESH__");
      window.__MASJID_LOCATION_DONE = false;
    }

    // If reopened in same tab, do NOT run GPS again
    if (window.__MASJID_LOCATION_DONE) {
      await fallbackToSaved();
      set({ initializing: false }); // 🔵 END LOADING
      return;
    }
    window.__MASJID_LOCATION_DONE = true;

    // Geolocation detection
    if (!navigator.geolocation) {
      await fallbackToSaved();
      set({ initializing: false }); // 🔵 END LOADING
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

          if (!nearest?.length) {
            await fallbackToSaved();
            return;
          }

          const m = nearest[0];
          const full = await publicAPI.getMasjidById(m._id);

          // Don't override if user already selected manually
          if (userHasManualSelection) return;

          set({
            selectedCity: m.city?._id || m.city,
            selectedArea: m.area?._id || m.area,
            selectedMasjid: full,
          });

          localStorage.setItem("selectedCityId", m.city?._id || m.city);
          localStorage.setItem("selectedAreaId", m.area?._id || m.area);
          localStorage.setItem("selectedMasjidId", m._id);
        } catch (err) {
          console.error("Nearest detection error", err);
          await fallbackToSaved();
        } finally {
          set({ loadingLocation: false, initializing: false }); // 🔵 END LOADING
        }
      },
      async () => {
        await fallbackToSaved();
        set({ loadingLocation: false, initializing: false }); // 🔵 END LOADING
      }
    );
  },
}));
