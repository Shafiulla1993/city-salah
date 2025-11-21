/// src/app/register/page.js

"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api/auth";
import { publicAPI } from "@/lib/api/public";
import { Input } from "@/components/form/Input";
import { Button } from "@/components/form/Button";
import { Select } from "@/components/form/Select";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load cities
  useEffect(() => {
    publicAPI
      .getCities()
      .then(setCities)
      .catch((err) => console.error("Failed to load cities:", err));
  }, []);

  // Load areas when city changes
  useEffect(() => {
    if (!form.city) return setAreas([]);
    publicAPI
      .getAreas(form.city)
      .then(setAreas)
      .catch((err) => console.error("Failed to load areas:", err));
  }, [form.city]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authAPI.register(form);
      console.log("User registered:", data);
      // redirect to login/dashboard
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-md shadow-md ">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
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
          disabled={!form.city || areas.length === 0}
          required
        />

        <Button type="submit" className={loading ? "opacity-50" : ""}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
