// src/app/auth/verify-email/VerifyEmailClient.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/form/Button";
import { Input } from "@/components/form/Input";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");
  const maskedEmail = params.get("email"); // optional from login redirect

  const [email, setEmail] = useState(maskedEmail || "");
  const [status, setStatus] = useState("idle"); // idle | verifying | error | sent
  const [error, setError] = useState("");

  // Auto verify when token exists
  useEffect(() => {
    if (!token) return;

    window.location.href = `/api/auth/verify-email?token=${token}`;
  }, [token]);

  async function handleResend() {
    setError("");
    setStatus("verifying");

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("sent");
    } catch (err) {
      setError(err.message || "Failed to send verification email.");
      setStatus("error");
    }
  }

  // If token exists, show verifying screen
  if (token) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-6 text-center">
        <h1 className="text-xl font-bold text-teal-700">Verifying...</h1>
        <p className="mt-3 text-slate-600">
          Please wait while we verify your email.
        </p>
      </div>
    );
  }

  // No token → manual email verification (legacy users)
  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-6 text-center space-y-4">
      <h1 className="text-xl font-bold text-teal-700">Verify Your Email</h1>

      <Input
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {status === "sent" ? (
        <p className="text-green-700 text-sm">
          Verification email sent. Please check your inbox.
        </p>
      ) : (
        <Button onClick={handleResend}>Send Verification Link</Button>
      )}
    </div>
  );
}
