// src/app/auqatus-salah/page.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function AuqatusSalahResolver() {
  const router = useRouter();

  const { init, initializing, selectedCitySlug, selectedAreaSlug } =
    useMasjidStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initializing) return;

    if (selectedCitySlug && selectedAreaSlug) {
      router.replace(`/${selectedCitySlug}/${selectedAreaSlug}/auqatus-salah`);
      return;
    }

    // fallback
    router.replace(`/mysore/rajiv-nagar/auqatus-salah`);
  }, [initializing, selectedCitySlug, selectedAreaSlug, router]);

  return null;
}
