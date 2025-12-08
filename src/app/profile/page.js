// src/app/profile/page.js
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { authAPI } from "@/lib/api/auth";
import { publicAPI } from "@/lib/api/public";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Select } from "@/components/form/Select";
import { notify } from "@/lib/toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [areasLoaded, setAreasLoaded] = useState(false);

  const [userNames, setUserNames] = useState({
    cityName: "",
    areaName: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    area: "",
    password: "",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  /** Load initial profile */
  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await authAPI.me();
        if (!meRes.loggedIn) return;

        const user = meRes.user;

        setUserNames({
          cityName: user.city?.name || "",
          areaName: user.area?.name || "",
        });

        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          city: user.city?._id || "",
          area: user.area?._id || "",
          password: "",
        });
      } catch {
        notify.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /** Load cities */
  async function loadCitiesIfNeeded() {
    if (citiesLoaded) return;
    try {
      const res = await publicAPI.getCities();
      setCities(res?.data || []);
      setCitiesLoaded(true);
    } catch {
      notify.error("Failed to load cities");
    }
  }

  /** Load areas */
  async function loadAreas(cityId) {
    if (!cityId) {
      setAreas([]);
      setAreasLoaded(false);
      return;
    }

    try {
      const res = await publicAPI.getAreas(cityId);
      setAreas(res?.data || []);
      setAreasLoaded(true);
    } catch {
      notify.error("Failed to load areas");
    }
  }

  /** Submit updated profile */
  async function handleUpdate(e) {
    e.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      area: form.area,
    };

    if (form.password.trim() !== "") {
      payload.password = form.password.trim();
    }

    try {
      const res = await authAPI.updateProfile(payload);
      if (res?.user) notify.success("Profile updated");
      update("password", "");
    } catch (err) {
      notify.error(err.message || "Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <p className="animate-pulse text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto py-10 space-y-8 px-3">
        <h1 className="text-3xl font-bold text-indigo-700 text-center drop-shadow-sm">
          Your Profile
        </h1>

        <form
          onSubmit={handleUpdate}
          className="
            space-y-6 
            bg-white/95 rounded-xl shadow-2xl 
            p-6 border border-white/40 backdrop-blur
          "
        >
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />

          {/* City */}
          <Select
            label="City"
            value={form.city}
            onClick={loadCitiesIfNeeded}
            onChange={(e) => {
              update("city", e.target.value);
              update("area", "");
              loadAreas(e.target.value);
            }}
            options={[
              ...(!citiesLoaded && form.city
                ? [{ value: form.city, label: userNames.cityName }]
                : []),
              ...cities.map((c) => ({ value: c._id, label: c.name })),
            ]}
            required
          />

          {/* Area */}
          <Select
            label="Area"
            value={form.area}
            onClick={() => loadAreas(form.city)}
            onChange={(e) => update("area", e.target.value)}
            disabled={!form.city}
            options={[
              ...(!areasLoaded && form.area
                ? [{ value: form.area, label: userNames.areaName }]
                : []),
              ...areas.map((a) => ({ value: a._id, label: a.name })),
            ]}
            required
          />

          <PasswordInput
            label="New Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Leave empty to keep current password"
          />

          <button
            type="submit"
            className="
              w-full py-3 rounded-lg text-lg font-semibold
              bg-indigo-600 hover:bg-indigo-700 text-white
              transition shadow-md
            "
          >
            Save Changes
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
