// src/app/masjid/[slug]/ClientMasjidRedirect.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function ClientMasjidRedirect({ masjid }) {
  const router = useRouter();
  const { setContextFromMasjid } = useMasjidStore();

  useEffect(() => {
    if (!masjid) return;

    // 🔑 SINGLE MASJID MODE (NO AREA SIDE EFFECTS)
    setContextFromMasjid(masjid);

    // Redirect user to real UI
    router.replace("/");
  }, [masjid, setContextFromMasjid, router]);

  return null;
}
