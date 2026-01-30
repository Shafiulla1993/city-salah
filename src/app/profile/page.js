// src/app/profile/page.js

"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Select } from "@/components/form/Select";
import { Button } from "@/components/form/Button";
import { useAuth } from "@/context/AuthContext";
import { publicAPI } from "@/lib/api/public";

function maskEmail(email) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  return `${name[0]}*****${name[name.length - 1]}@${domain}`;
}

export default function ProfilePage() {
  const { user, fetchLoginState } = useAuth();

  const [infoForm, setInfoForm] = useState({
    name: "",
    phone: "",
    city: "",
    area: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load profile into form
  useEffect(() => {
    if (!user) return;

    setInfoForm({
      name: user.name || "",
      phone: user.phone || "",
      city: user.city?._id || "",
      area: user.area?._id || "",
    });
  }, [user]);

  // Load cities
  useEffect(() => {
    publicAPI.getCities().then((res) => {
      if (Array.isArray(res)) setCities(res);
    });
  }, []);

  // Load areas when city changes
  useEffect(() => {
    if (!infoForm.city) return setAreas([]);
    publicAPI.getAreas(infoForm.city).then((res) => {
      if (Array.isArray(res)) setAreas(res);
    });
  }, [infoForm.city]);

  const updateInfo = (key, value) =>
    setInfoForm((prev) => ({ ...prev, [key]: value }));

  const updatePassword = (key, value) =>
    setPasswordForm((prev) => ({ ...prev, [key]: value }));

  // ---------------- PROFILE INFO UPDATE ----------------
  async function handleInfoSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(infoForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setMessage("Profile updated successfully.");
      await fetchLoginState();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- CHANGE PASSWORD ----------------
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");

      setMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- SEND VERIFICATION ----------------
  async function handleSendVerification() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");

      setMessage("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
        <h1 className="text-3xl font-bold text-center text-teal-700">
          My Profile
        </h1>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
            {error}
          </div>
        )}

        {/* ================= PROFILE INFO ================= */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Profile Information
          </h2>

          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={infoForm.name}
              onChange={(e) => updateInfo("name", e.target.value)}
              required
            />

            <Input
              label="Phone"
              value={infoForm.phone}
              onChange={(e) => updateInfo("phone", e.target.value)}
              required
            />

            <Select
              label="City"
              value={infoForm.city}
              onChange={(e) => {
                updateInfo("city", e.target.value);
                updateInfo("area", "");
              }}
              options={cities.map((c) => ({ label: c.name, value: c._id }))}
              required
            />

            <Select
              label="Area"
              value={infoForm.area}
              onChange={(e) => updateInfo("area", e.target.value)}
              options={areas.map((a) => ({ label: a.name, value: a._id }))}
              disabled={!infoForm.city}
              required
            />

            <Button type="submit" disabled={loading}>
              Save Profile
            </Button>
          </form>
        </section>

        {/* ================= EMAIL STATUS ================= */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Email Verification
          </h2>

          <p className="text-slate-700">
            Email:{" "}
            <span className="font-semibold">
              {user?.emailVerified ? user.email : maskEmail(user?.email)}
            </span>
          </p>

          {user?.emailVerified ? (
            <p className="text-green-700 font-medium">Email is verified ✅</p>
          ) : (
            <>
              <p className="text-amber-700">
                Your email is not verified. Please verify to secure your
                account.
              </p>
              <Button
                type="button"
                onClick={handleSendVerification}
                disabled={loading}
              >
                Verify Now
              </Button>
            </>
          )}
        </section>

        {/* ================= CHANGE PASSWORD ================= */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                updatePassword("currentPassword", e.target.value)
              }
              required
            />

            <PasswordInput
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => updatePassword("newPassword", e.target.value)}
              required
            />

            <Button type="submit" disabled={loading}>
              Change Password
            </Button>
          </form>
        </section>
      </div>
    </ProtectedRoute>
  );
}
