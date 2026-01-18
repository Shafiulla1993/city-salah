// src/app/auth/verify-email/VerifyEmailClient.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/form/Button";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | error

  useEffect(() => {
    if (!token) return;

    // Let browser handle redirect & cookies
    window.location.href = `/api/auth/verify-email?token=${token}`;
  }, [token]);

  async function handleResend() {
    try {
      await fetch("/api/auth/send-verification", {
        method: "POST",
        credentials: "include",
      });
      alert("Verification email sent. Please check your inbox.");
    } catch {
      alert("Failed to send verification email.");
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-6 text-center">
        <h1 className="text-xl font-bold text-teal-700">Verify Your Email</h1>
        <p className="mt-3 text-slate-600">Verification link is missing.</p>
        <Button onClick={handleResend} className="mt-4">
          Resend Verification Email
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-6 text-center">
      <h1 className="text-xl font-bold text-teal-700">Verifying...</h1>
      <p className="mt-3 text-slate-600">
        Please wait while we verify your email.
      </p>
    </div>
  );
}
