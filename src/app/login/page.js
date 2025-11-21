"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { Input } from "@/components/form/Input";
import { Button } from "@/components/form/Button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Alert } from "@/components/alerts/Alert";

export default function LoginPage() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { fetchLoginState } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const data = await authAPI.login(form);

      setAlert({ type: "success", message: "Login successful!" });
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
      setAlert({
        type: "error",
        message: err?.message || "Invalid phone or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center ">
      <div
        className="w-full max-w-md bg-slate-300/40 backdrop-blur-xl 
                      border border-slate-100/30 shadow-2xl rounded-2xl p-10"
      >
        <h1 className="text-3xl font-bold text-slate-900 text-center drop-shadow mb-6">
          Login to City Salah
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
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">Phone Number</label>
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

          <div className="flex flex-col gap-2">
            <label className="text-slate-900 font-semibold">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-800">
          New here?
          <Link
            href="/register"
            className="ml-1 font-semibold underline text-slate-900 hover:text-black"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
