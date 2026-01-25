// src/app/dashboard/super-admin/page.js

"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminCard from "@/components/admin/AdminCard";
import StatsCards from "./components/StatsCards";
import StatsCardsSkeleton from "./components/skeletons/StatsCardsSkeleton";

import UsersTab from "./manage/tabs/UsersTab";
import CitiesTab from "./manage/tabs/CitiesTab";
import AreasTab from "./manage/tabs/AreasTab";
import MasjidsTab from "./manage/tabs/MasjidsTab";
import TimingsTab from "./manage/tabs/TimingsTab";
import ThoughtsTab from "./manage/tabs/ThoughtsTab";
import GeneralAnnouncementTab from "./manage/tabs/GeneralAnnouncementTab";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");

  const tabs = [
    { key: "users", label: "Users" },
    { key: "cities", label: "Cities" },
    { key: "areas", label: "Areas" },
    { key: "masjids", label: "Masjids" },
    { key: "announcements", label: "Announcements" },
    { key: "thoughts", label: "Thoughts" },
    { key: "timings", label: "Prayer Timings" },
  ];

  useEffect(() => {
    async function loadStats() {
      const res = await fetch("/api/super-admin/dashboard", {
        credentials: "include",
      });
      const data = await res.json();
      setStats(data);
      setLoading(false);
    }

    loadStats();
  }, []);

  return (
    <ProtectedRoute role="super_admin">
      <div className="space-y-6">
        {/* 🔢 Always on top */}
        <AdminCard>
          {loading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
        </AdminCard>

        {/* 📑 Tabs strip */}
        <AdminTabs tabs={tabs} active={tab} onChange={setTab} />

        {/* 📂 Active panel */}
        <AdminCard>
          {tab === "users" && <UsersTab />}
          {tab === "cities" && <CitiesTab />}
          {tab === "areas" && <AreasTab />}
          {tab === "masjids" && <MasjidsTab />}
          {tab === "announcements" && <GeneralAnnouncementTab />}
          {tab === "thoughts" && <ThoughtsTab />}
          {tab === "timings" && <TimingsTab />}
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
