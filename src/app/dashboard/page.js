// src/app/dashboard/page.js

"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminAuthSkeleton from "@/components/auth/AdminAuthSkeleton";

export default function DashboardRouter() {
  const { loggedIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!loggedIn) {
      router.replace("/auth/login");
      return;
    }

    if (user.role === "super_admin") {
      router.replace("/dashboard/super-admin");
    } else if (user.role === "masjid_admin") {
      router.replace("/dashboard/masjid-admin");
    } else {
      router.replace("/dashboard/public");
    }
  }, [loading, loggedIn, user, router]);

  return <AdminAuthSkeleton />;
}
