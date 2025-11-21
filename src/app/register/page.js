"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api/auth";
import { publicAPI } from "@/lib/api/public";
import { Input } from "@/components/form/Input";
import { Button } from "@/components/form/Button";
import { Select } from "@/components/form/Select";
import Link from "next/link";
import { Alert } from "@/components/alerts/Alert";

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
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    publicAPI.getCities().then(setCities).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.city) return setAreas([]);
    publicAPI.getAreas(form.city).then(setAreas).catch(console.error);
  }, [form.city]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const data = await authAPI.register(form);
      setAlert({ type: "success", message: "Registered successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div
        className="
          w-full max-w-md bg-slate-300/40 backdrop-blur-xl 
          border border-slate-100/30 shadow-2xl rounded-2xl p-10
        "
      >
        <h1 className="text-3xl font-bold text-slate-900 text-center drop-shadow mb-6">
          Create an Account
        </h1>

        {alert.message && (
          <Alert
            type={alert.type}
            message={alert.message}
            duration={3500}
            onClose={() => setAlert({ type: "", message: "" })}
          />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">Full Name</label>
            <Input
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              className="
                w-full h-12 text-slate-900 placeholder-slate-500 
                bg-white rounded-lg
                border border-slate-400
                focus:ring-2 focus:ring-slate-700
                focus:border-slate-700
              "
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">Phone</label>
            <Input
              name="phone"
              placeholder="Enter your phone"
              value={form.phone}
              onChange={handleChange}
              className="
                w-full h-12 text-slate-900 placeholder-slate-500 
                bg-white rounded-lg
                border border-slate-400
                focus:ring-2 focus:ring-slate-700
                focus:border-slate-700
              "
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="
                w-full h-12 text-slate-900 placeholder-slate-500 
                bg-white rounded-lg
                border border-slate-400
                focus:ring-2 focus:ring-slate-700
                focus:border-slate-700
              "
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">City</label>
            <Select
              name="city"
              value={form.city}
              onChange={handleChange}
              options={cities}
              required
              className="
                w-full h-12 text-slate-900 
                bg-white rounded-lg 
                border border-slate-400
                focus:ring-2 focus:ring-slate-700
              "
            />
          </div>

          {/* Area */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">Area</label>
            <Select
              name="area"
              value={form.area}
              onChange={handleChange}
              options={areas}
              disabled={!form.city || areas.length === 0}
              required
              className="
                w-full h-12 text-slate-900 
                bg-white rounded-lg 
                border border-slate-400 
                focus:ring-2 focus:ring-slate-700
              "
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="
              w-full h-12 mt-2 rounded-lg text-lg font-semibold
              bg-slate-900 text-white 
              hover:bg-slate-800
              transition-all duration-200 shadow-md
            "
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-800">
          Already have an account?
          <Link
            href="/login"
            className="ml-1 font-semibold underline text-slate-900 hover:text-black"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
