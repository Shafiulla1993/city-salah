//  src/app/dashboard/masjid-admin/page.js

"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminCard from "@/components/admin/AdminCard";

import MasjidsTab from "./manage/tabs/MasjidsTab";
import AnnouncementsTab from "./manage/tabs/AnnouncementsTab";

export default function MasjidAdminDashboard() {
  const [tab, setTab] = useState("masjids");

  const tabs = [
    { key: "masjids", label: "My Masjids" },
    { key: "announcements", label: "My Announcements" },
  ];

  return (
    <ProtectedRoute role="masjid_admin">
      <div className="space-y-6">
        {/* Header (light, same hierarchy as super-admin) */}
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Masjid Admin Dashboard
          </h1>
          <p className="text-sm text-gray-700">
            Manage prayer timings, contacts, address and announcements
          </p>
        </header>

        {/* Tabs strip (same component as super-admin) */}
        <AdminTabs tabs={tabs} active={tab} onChange={setTab} />

        {/* Active panel (same AdminCard wrapper) */}
        <AdminCard>
          {tab === "masjids" && <MasjidsTab />}
          {tab === "announcements" && <AnnouncementsTab />}
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
