// src/components/auth/ProtectedRoute.js
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminAuthSkeleton from "@/components/auth/AdminAuthSkeleton";

export default function ProtectedRoute({ role = null, children }) {
  const { loggedIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in → redirect
    if (!loggedIn) {
      router.replace("/auth/login");
      return;
    }

    // If specific role required → block others
    if (role && user?.role !== role) {
      router.replace("/forbidden"); // Create later
    }
  }, [loading, loggedIn, user, role, router]);

  // Show skeleton while verifying auth
  if (loading) return <AdminAuthSkeleton />;

  // Prevent flash before redirect
  if (!loggedIn) return null;
  if (role && user?.role !== role) return null;

  return children;
}
