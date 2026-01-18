// src/components/auth/VerifyEmailBanner.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/form/Button";
import { useAuth } from "@/context/AuthContext";

function maskEmail(email) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  return `${name[0]}*****${name[name.length - 1]}@${domain}`;
}

export default function VerifyEmailBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user || user.emailVerified) return null;

  async function handleVerify() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");

      router.push(
        `/auth/verify-email?masked=${encodeURIComponent(maskEmail(user.email))}`
      );
    } catch (err) {
      setMessage(err.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="text-sm">
        Your email <strong>{maskEmail(user.email)}</strong> is not verified.
        Please verify to secure your account.
      </div>

      <div className="flex items-center gap-2">
        {message && <span className="text-xs text-red-600">{message}</span>}
        <Button
          onClick={handleVerify}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1.5"
        >
          {loading ? "Sending..." : "Verify Now"}
        </Button>
      </div>
    </div>
  );
}
