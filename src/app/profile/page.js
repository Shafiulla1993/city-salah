// src/app/profile/page.js

"use client";

import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api/auth";
import { publicAPI } from "@/lib/api/public";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Select } from "@/components/form/Select";
import { Button } from "@/components/form/Button";
import { notify } from "@/lib/toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [areasLoaded, setAreasLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    area: "",
    password: "",
  });

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  /* -------------------------------------------------
   * LOAD USER ONLY (NO CITIES, NO AREAS YET)
   * ------------------------------------------------- */
  useEffect(() => {
    async function loadUser() {
      try {
        const me = await authAPI.me();

        if (!me.loggedIn) return notify.error("Not logged in");

        const user = me.user;

        setForm({
          name: user.name,
          email: user.email || "",
          phone: user.phone,
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

    loadUser();
  }, []);

  /* -------------------------------------------------
   * LOAD CITIES ONLY WHEN USER CLICKS THE DROPDOWN
   * ------------------------------------------------- */
  async function loadCities() {
    if (citiesLoaded) return; // avoid reloading

    try {
      const res = await publicAPI.getCities();
      setCities(res.data || []);
      setCitiesLoaded(true);
    } catch {
      notify.error("Failed to load cities");
    }
  }

  /* -------------------------------------------------
   * LOAD AREAS ONLY WHEN USER EXPANDS AREA DROPDOWN
   * ------------------------------------------------- */
  async function loadAreas(cityId) {
    if (!cityId) return;

    try {
      const res = await publicAPI.getAreas(cityId);
      setAreas(res.data || []);
      setAreasLoaded(true);
    } catch {
      notify.error("Failed to load areas");
    }
  }

  /* -------------------------------------------------
   * WHEN CITY IS CHANGED, RESET AREA
   * ------------------------------------------------- */
  async function handleCityChange(cityId) {
    update("city", cityId);
    update("area", "");

    setAreas([]);
    setAreasLoaded(false);

    await loadAreas(cityId);
  }

  /* -------------------------------------------------
   * UPDATE PROFILE
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
      payload.password = form.password;
    }

    try {
      const res = await authAPI.updateProfile(payload);

      if (res?.user) notify.success("Profile updated successfully");

      update("password", "");
    } catch (err) {
      notify.error(err.message || "Failed to update profile");
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
        {/* Name */}
        <Input
          label="Full Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        {/* Email */}
        <Input
          label="Email Address"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        {/* City */}
        <Select
          label="City"
          value={form.city}
          options={cities.map((c) => ({
            value: c._id,
            label: c.name,
          }))}
          onChange={(e) => handleCityChange(e.target.value)}
          onClick={loadCities} // 👈 Lazy load
          placeholder="Select city"
        />

        {/* Area */}
        <Select
          label="Area"
          value={form.area}
          options={areas.map((a) => ({
            value: a._id,
            label: a.name,
          }))}
          onChange={(e) => update("area", e.target.value)}
          onClick={() => loadAreas(form.city)} // 👈 Lazy load
          placeholder="Select area"
          disabled={!form.city}
        />

        {/* Password */}
        <PasswordInput
          label="New Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Leave empty if unchanged"
        />

        {/* Save Button */}
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
