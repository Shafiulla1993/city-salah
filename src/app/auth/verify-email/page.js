// src/app/auth/verify-email/page.js

import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-6 text-center">
          <p className="text-slate-600">Loading verification...</p>
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
