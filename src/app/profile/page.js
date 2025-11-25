// src/app/profile/page.js

"use client";

import { useEffect, useState } from "react";
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

  /* -------------------------------------------------
   * INITIAL LOAD → USER + USER CITY/AREA NAMES
   * ------------------------------------------------- */
  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await authAPI.me();
        if (!meRes.loggedIn) {
          notify.error("Not logged in");
          return;
        }

        const user = meRes.user;

        // store for temporary display
        setUserNames({
          cityName: user.city?.name || "",
          areaName: user.area?.name || "",
        });

        // initial form values
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          city: user.city?._id || "",
          area: user.area?._id || "",
          password: "",
        });
      } catch (err) {
        notify.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* -------------------------------------------------
   * LOAD ALL CITIES → only when dropdown is clicked
   * ------------------------------------------------- */
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

  /* -------------------------------------------------
   * LOAD AREAS → only when city changes or dropdown clicked
   * ------------------------------------------------- */
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

  /* -------------------------------------------------
   * CITY SELECTED
   * ------------------------------------------------- */
  async function handleCityChange(cityId) {
    update("city", cityId);
    update("area", "");
    setAreas([]);
    setAreasLoaded(false);

    await loadAreas(cityId);
  }

  /* -------------------------------------------------
   * AREA SELECTED
   * ------------------------------------------------- */
  function handleAreaChange(areaId) {
    update("area", areaId);
  }

  /* -------------------------------------------------
   * SUBMIT UPDATE PROFILE
   * ------------------------------------------------- */
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
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <form
        onSubmit={handleUpdate}
        className="space-y-6 bg-white p-6 rounded-xl shadow"
      >
        {/* Full Name */}
        <Input
          label="Full Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        {/* Email */}
        <Input
          label="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        {/* Phone */}
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        {/* City */}
        <Select
          label="City"
          value={form.city}
          onClick={loadCitiesIfNeeded}
          onChange={(e) => handleCityChange(e.target.value)}
          options={[
            // temporary selected city until cities are loaded
            ...(!citiesLoaded && form.city
              ? [{ value: form.city, label: userNames.cityName }]
              : []),

            ...cities.map((c) => ({
              value: c._id,
              label: c.name,
            })),
          ]}
        />

        {/* Area */}
        <Select
          label="Area"
          value={form.area}
          onClick={() => loadAreas(form.city)}
          onChange={(e) => handleAreaChange(e.target.value)}
          disabled={!form.city}
          options={[
            // temporary selected area until areas load
            ...(!areasLoaded && form.area
              ? [{ value: form.area, label: userNames.areaName }]
              : []),

            ...areas.map((a) => ({
              value: a._id,
              label: a.name,
            })),
          ]}
        />

        {/* Password */}
        <PasswordInput
          label="New Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Leave empty to keep current password"
        />

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-md"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
