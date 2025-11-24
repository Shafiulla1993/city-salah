// src/app/login/page.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Button } from "@/components/form/Button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { fetchLoginState } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authAPI.login(form);

      toast.success("Login successful!");
      await fetchLoginState();

      switch (data.user.role) {
        case "super_admin":
          router.push("/dashboard/super-admin");
          break;
        case "masjid_admin":
          router.push("/dashboard/masjid-admin");
          break;
        default:
          router.push("/");
      }
    } catch (err) {
      toast.error(err?.message || "Invalid phone or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div
        className="
          w-full max-w-md
          rounded-2xl shadow-2xl
          p-10
          bg-gradient-to-br from-slate-100 to-slate-300
          border border-slate-300
        "
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-slate-900">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <Input
            label="Phone Number"
            name="phone"
            placeholder="Enter your phone"
            value={form.phone}
            onChange={handleChange}
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 rounded-lg
              font-semibold text-lg shadow-lg
              bg-slate-500 hover:bg-slate-600
              text-white transition-all
            "
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-700">
          New here?
          <Link
            href="/register"
            className="ml-1 font-semibold underline text-slate-900 hover:text-slate-600"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
