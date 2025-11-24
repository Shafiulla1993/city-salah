"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api/auth";
import { publicAPI } from "@/lib/api/public";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Button } from "@/components/form/Button";
import { Select } from "@/components/form/Select";
import Link from "next/link";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    city: "",
    area: "",
  });

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load cities
  useEffect(() => {
    publicAPI.getCities().then((res) => {
      if (Array.isArray(res)) {
        setCities(
          res.map((c) => ({
            label: c.name,
            value: c._id,
          }))
        );
      }
    });
  }, []);

  // Load areas when city changes
  useEffect(() => {
    if (!form.city) return setAreas([]);

    publicAPI.getAreas(form.city).then((res) => {
      if (Array.isArray(res)) {
        setAreas(
          res.map((a) => ({
            label: a.name,
            value: a._id,
          }))
        );
      }
    });
  }, [form.city]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.register(form);
      toast.success("Registered successfully!");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md rounded-2xl shadow-2xl p-10
          bg-gradient-to-br from-slate-100 to-slate-300
          border border-slate-300
        "
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-slate-900">
          Create an Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone"
            name="phone"
            placeholder="Enter your phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* City */}
          <Select
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            options={cities}
            required
          />

          {/* Area */}
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
            className="
              w-full h-12 rounded-lg text-lg font-semibold
              bg-slate-500 text-white hover:bg-slate-600
              transition-all duration-200 shadow-md
            "
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-700">
          Already have an account?
          <Link
            href="/login"
            className="ml-1 font-semibold underline text-slate-900 hover:text-slate-600"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
