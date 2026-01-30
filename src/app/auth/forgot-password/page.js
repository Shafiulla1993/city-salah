// src/app/auth/forgot-password/page.js

"use client";

import { useState } from "react";
import { Input } from "@/components/form/Input";
import { Button } from "@/components/form/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(
        data.message || "If the email exists, a reset link has been sent.",
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-6 space-y-4">
      <h1 className="text-2xl font-bold text-teal-700 text-center">
        Forgot Password
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      {message && <p className="text-sm text-center">{message}</p>}
    </div>
  );
}
