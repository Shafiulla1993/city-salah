//  src/app/dashboard/masjid-admin/page.js

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminCard from "@/components/admin/AdminCard";
import MasjidsTab from "./manage/tabs/MasjidsTab";
import AnnouncementsTab from "./manage/tabs/AnnouncementsTab";

export default function MasjidAdminDashboard() {
  const [tab, setTab] = useState("masjids");
  const { user, loading } = useAuth();

  const tabs = [
    { key: "masjids", label: "My Masjids" },
    { key: "announcements", label: "Announcements" },
  ];

  // ⛔ Prevent children from mounting until correct role
  if (loading) return null;
  if (!user || user.role !== "masjid_admin") return null;

  return (
    <ProtectedRoute role="masjid_admin">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Masjid Admin Dashboard
          </h1>
          <p className="text-sm text-gray-700">
            Manage prayer timings, contacts and announcements
          </p>
        </header>

        <AdminTabs tabs={tabs} active={tab} onChange={setTab} />

        <AdminCard>
          {tab === "masjids" && <MasjidsTab />}
          {tab === "announcements" && <AnnouncementsTab />}
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
