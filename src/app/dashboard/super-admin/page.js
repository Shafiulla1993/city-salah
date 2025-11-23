// src/app/dashboard/super-admin/page.js

"use client";

import React, { useEffect, useState } from "react";
import StatsCards from "./components/StatsCards";
import QuickActions from "./components/QuickActions";
import { adminAPI } from "@/lib/api/sAdmin";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StatsCardsSkeleton from "./components/skeletons/StatsCardsSkeleton";
import QuickActionsSkeleton from "./components/skeletons/QuickActionsSkeleton";
import AdminCard from "@/components/admin/AdminCard";

export default function SuperAdminHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await adminAPI.getDashboard();
        if (!mounted) return;
        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <ProtectedRoute role="super_admin">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">Super Admin Dashboard</h1>
        </header>

        <AdminCard>
          {loading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
        </AdminCard>

        <AdminCard title="Quick Actions">
          {loading ? <QuickActionsSkeleton /> : <QuickActions />}
        </AdminCard>

        <AdminCard title="Recent Activity">
          <p className="text-gray-600">(coming soon)</p>
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
