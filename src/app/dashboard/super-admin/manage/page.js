// src/app/dashboard/super-admin/manage/page.js

"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UsersTab from "./tabs/UsersTab";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminCard from "@/components/admin/AdminCard";

export default function ManageMain() {
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

  return (
    <ProtectedRoute role="super_admin">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">Manage Data</h1>
          <p className="text-sm text-gray-700">Select what you want to manage</p>
        </header>

        <AdminTabs tabs={tabs} active={tab} onChange={setTab} />

        <AdminCard>
          {tab === "users" ? (
            <UsersTab />
          ) : (
            <div className="text-gray-600">
              <p>Module <strong>{tab}</strong> will be implemented soon.</p>
            </div>
          )}
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
