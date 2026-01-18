// src/app/login/LoginClient.js
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import { Button } from "@/components/form/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchLoginState } = useAuth();

  const redirectMsg = searchParams.get("msg");

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [legacyEmail, setLegacyEmail] = useState("");
  const [needEmail, setNeedEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(null);
  const [info, setInfo] = useState("");

  const [modalError, setModalError] = useState("");
  const [modalInfo, setModalInfo] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setVerifyEmail(null);
    setNeedEmail(false);

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_REQUIRED") {
          setNeedEmail(true);
          return;
        }

        if (data.code === "EMAIL_NOT_VERIFIED") {
          setVerifyEmail(data.email);
          setError("Your email is not verified.");
          return;
        }

        throw new Error(data.message || "Login failed");
      }

      // 🔥 Sync AuthContext immediately (no refresh needed)
      await fetchLoginState();
      router.replace("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
  setLoading(true);
  setError("");
  setInfo("");

  try {
    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verifyEmail }),   // 👈 IMPORTANT
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setInfo("Verification email sent. Please check your inbox.");
  } catch (err) {
    setError(err.message || "Failed to send verification email");
  } finally {
    setLoading(false);
  }
}


  async function handleAttachEmail() {
  setModalError("");
  setModalInfo("");

  try {
    const res = await fetch("/api/auth/attach-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.identifier, 
        email: legacyEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send verification");

    setModalInfo("Verification link sent. Please check your email.");
  } catch (err) {
    setModalError(err.message || "Failed to attach email");
  }
}

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-10 space-y-6">
        <h1 className="text-3xl font-bold text-center text-teal-700">Login</h1>

        {redirectMsg && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded">
            {redirectMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded">
            {info}
          </div>
        )}

        {verifyEmail && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 px-4 py-3 rounded space-y-2">
            <p className="font-medium">Please verify your email:</p>
            <p className="text-sm">{verifyEmail}</p>

            <Button onClick={handleResendVerification} disabled={loading}>
              Resend Verification Email
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Phone or Email"
            name="identifier"
            value={form.identifier}
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-lg bg-teal-600 hover:bg-teal-700 text-white"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-sm text-center text-slate-600 space-y-2">
            <p>
              New here?{" "}
              <a href="/auth/register" className="text-teal-700 font-semibold underline">
                Create an account
              </a>
            </p>
            <p>
              Forgot your password?{" "}
              <a href="/auth/forgot-password" className="text-teal-700 font-semibold underline">
                Reset it here
              </a>
            </p>
          </div>
        </form>
      </div>

      {needEmail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-teal-700">Verify Your Email</h2>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {modalError}
              </div>
            )}

            {modalInfo && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded text-sm">
                {modalInfo}
              </div>
            )}

            <Input
              label="Email"
              value={legacyEmail}
              onChange={(e) => setLegacyEmail(e.target.value)}
              required
            />

            <Button onClick={handleAttachEmail}>Verify Now</Button>
          </div>
        </div>
      )}
    </div>
  );
}
