// src/components/sAdminDashboard/formConfig.js

import { adminAPI } from "@/lib/api/sAdmin";

export const formConfig = {
  city: {
    title: "City",
    fields: [
      { name: "name", label: "City Name", type: "text", required: true },
    ],
    getFn: adminAPI.getCityById,
    createFn: adminAPI.createCity,
    updateFn: adminAPI.updateCity,
  },

  area: {
    title: "Area",
    fields: [
      { name: "name", label: "Area Name", type: "text", required: true },
      { name: "city", label: "City", type: "select", source: "cities" },
    ],
    getFn: adminAPI.getAreaById,
    createFn: adminAPI.createArea,
    updateFn: adminAPI.updateArea,
  },

  user: {
    title: "User",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "city", label: "City", type: "select", source: "cities" },
      { name: "area", label: "Area", type: "select", source: "areas" },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: ["super-admin", "admin", "mutawalli"],
      },
    ],
    getFn: adminAPI.getUserById,
    createFn: adminAPI.createUser,
    updateFn: adminAPI.updateUser,
  },

  masjid: {
    title: "Masjid",
    fields: [
      { name: "name", label: "Masjid Name", type: "text", required: true },
      { name: "city", label: "City", type: "select", source: "cities" },
      { name: "area", label: "Area", type: "select", source: "areas" },
      { name: "address", label: "Address", type: "text" },
    ],
    getFn: adminAPI.getMasjidById,
    createFn: adminAPI.createMasjid,
    updateFn: adminAPI.updateMasjid,
  },
};
