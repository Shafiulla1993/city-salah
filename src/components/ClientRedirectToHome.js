// /src/components/ClientRedirectToHome.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirectToHome() {
  const router = useRouter();

  useEffect(() => {
    // Allow crawlers to read server HTML before redirecting real users
    const t = setTimeout(() => router.replace("/"), 250);
    return () => clearTimeout(t);
  }, [router]);

  return null;
}
