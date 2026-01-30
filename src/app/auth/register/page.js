// src/app/auth/register/page.js
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Button } from "@/components/form/Button";
import { Select } from "@/components/form/Select";
import { publicAPI } from "@/lib/api/public";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    area: "",
  });

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  useEffect(() => {
    publicAPI.getCities().then((res) => {
      if (Array.isArray(res)) {
        setCities(res.map((c) => ({ label: c.name, value: c._id })));
      }
    });
  }, []);

  useEffect(() => {
    if (!form.city) return setAreas([]);
    publicAPI.getAreas(form.city).then((res) => {
      if (Array.isArray(res)) {
        setAreas(res.map((a) => ({ label: a.name, value: a._id })));
      }
    });
  }, [form.city]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Clear form after success
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        city: "",
        area: "",
      });
      setAreas([]);

      // Show instruction popup
      setShowVerifyPopup(true);

      setShowVerifyPopup(true); // show instruction popup
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-10 space-y-6">
        <h1 className="text-3xl font-bold text-center text-teal-700">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <Select
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            options={cities}
            required
          />

          <Select
            label="Area"
            name="area"
            value={form.area}
            onChange={handleChange}
            options={areas}
            disabled={!form.city}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-lg bg-teal-600 hover:bg-teal-700 text-white"
          >
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>
      </div>

      {/* Verification Instruction Popup */}
      {showVerifyPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 shadow-xl text-center max-w-sm">
            <p className="font-semibold text-lg text-teal-700">
              Verify your email
            </p>

            <p className="text-sm text-gray-600">
              We have sent a verification link to:
            </p>

            <p className="font-medium text-gray-800">{form.email}</p>

            <p className="text-sm text-gray-500">
              Please check your inbox and click the verification link to
              activate your account.
            </p>

            <Button
              onClick={() => setShowVerifyPopup(false)}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
