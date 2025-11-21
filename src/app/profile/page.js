// src/app/profile/page.js

"use client";

import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api/auth";
import { Input } from "@/components/form/Input";
import { Alert } from "@/components/alerts/Alert"; // your reusable alert

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await authAPI.me();
        if (res.loggedIn) {
          setUser(res.user);
          setName(res.user.name);
          setPhone(res.user.phone);
          setCity(res.user.city);
          setArea(res.user.area);
        }
      } catch (err) {
        setAlert({ type: "error", message: err.message });
      }
    }
    fetchUser();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();

    const payload = {
      name,
      phone,
      city,
      area,
    };

    // only include password if user provided it
    if (password.trim() !== "") {
      payload.password = password;
    }

    try {
      const updated = await authAPI.updateProfile(payload);

      setAlert({
        type: "success",
        message: "Profile updated successfully.",
      });

      setPassword(""); // clear password field
      setUser(updated.user);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  }

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <form className="space-y-4" onSubmit={handleUpdate}>
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <Input
          label="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="Leave empty if you don't want to change"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
