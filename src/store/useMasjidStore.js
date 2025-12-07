// src/store/useMasjidStore.js
import { create } from "zustand";
import { publicAPI } from "@/lib/api/public";

export const useMasjidStore = create((set, get) => ({
  selectedCity: "",
  selectedArea: "",
  selectedMasjid: null,

  initialized: false,
  loadingLocation: false,
  userHasManualSelection: false,

  // ---------- setters called from UI ----------
  setCity: (cityId) => {
    set({
      selectedCity: cityId,
      selectedArea: "",
      selectedMasjid: null,
      userHasManualSelection: true,
    });
    if (cityId) localStorage.setItem("selectedCityId", cityId);
  },

  setArea: (areaId) => {
    set({
      selectedArea: areaId,
      selectedMasjid: null,
      userHasManualSelection: true,
    });
    if (areaId) localStorage.setItem("selectedAreaId", areaId);
  },

  setMasjid: (masjid) => {
    set({
      selectedMasjid: masjid,
      userHasManualSelection: true,
    });
    if (masjid?._id) {
      localStorage.setItem("selectedMasjidId", masjid._id);
    }
  },

  // ---------- init on first load (per tab) ----------
  // Priority: location → registered masjid → saved masjid → manual selection
  // inside Zustand store
  init: (user) => {
    const { initialized, userHasManualSelection } = get();
    if (initialized) return; // don't run again on tab navigation
    set({ initialized: true });

    const detectNearest = async (pos) => {
      try {
        const nearest = await publicAPI.getNearestMasjids({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          limit: 1,
        });

        if (!nearest?.length) return;
        const m = nearest[0];
        const full = await publicAPI.getMasjidById(m._id);

        // Do not override if user changed manually
        if (get().userHasManualSelection) return;

        set({
          selectedCity: m.city?._id || m.city,
          selectedArea: m.area?._id || m.area,
          selectedMasjid: full,
        });

        localStorage.setItem("selectedCityId", m.city?._id || m.city);
        localStorage.setItem("selectedAreaId", m.area?._id || m.area);
        localStorage.setItem("selectedMasjidId", m._id);
      } catch (err) {
        console.error("Nearest masjid error:", err);
      }
    };

    const fallbackToSavedOrRegistered = async () => {
      const savedMasjidId = localStorage.getItem("selectedMasjidId");
      if (savedMasjidId) {
        const data = await publicAPI.getMasjidById(savedMasjidId);
        set({
          selectedCity: data.city?._id || data.city,
          selectedArea: data.area?._id || data.area,
          selectedMasjid: data,
        });
      }
    };

    // ---- detect manual refresh ----
    const nav = performance.getEntriesByType("navigation")[0];
    const isRefresh = nav?.type === "reload";

    // ---- F5 / pull-to-refresh should ALWAYS trigger nearest ----
    if (isRefresh) {
      window.__MASJID_LOCATION_DONE = false;
    }

    // ---- Prevent auto-location on tab switch ----
    if (window.__MASJID_LOCATION_DONE) {
      fallbackToSavedOrRegistered();
      return;
    }

    window.__MASJID_LOCATION_DONE = true; // only for this tab

    // ---- Now try geolocation ----
    if (!navigator.geolocation) {
      fallbackToSavedOrRegistered();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await detectNearest(pos);
      },
      async () => {
        await fallbackToSavedOrRegistered();
      }
    );
  },
}));
