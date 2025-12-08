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
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div
        className="
          w-full max-w-md
          bg-white/95 rounded-2xl shadow-2xl
          border border-white/40 backdrop-blur
          p-10 space-y-6
        "
      >
        <h1 className="text-3xl font-bold text-center text-indigo-700 drop-shadow-sm">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Phone Number"
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

          <Button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 rounded-lg
              font-semibold text-lg shadow-md
              bg-indigo-600 hover:bg-indigo-700
              text-white transition-all
            "
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-slate-700 text-sm">
          New here?
          <Link
            href="/register"
            className="ml-1 font-semibold underline text-indigo-700 hover:text-indigo-900"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
