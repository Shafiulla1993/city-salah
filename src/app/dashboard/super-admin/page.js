// src/app/dashboard/super-admin/page.js
"use client";

import React, { useEffect, useState } from "react";
import SuperAdminDashboard from "@/components/sAdminDashbaord/dashboard";
import { adminAPI } from "@/lib/api/sAdmin";

export default function SuperAdminPage() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const citiesData = await adminAPI.getCities();
        const areasData = await adminAPI.getAreas();
        const masjidsData = await adminAPI.getMasjids();
        const usersData = await adminAPI.getUsers();

        setCities(citiesData || []);
        setAreas(areasData || []);
        setMasjids(masjidsData || []);
        setUsers(usersData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <SuperAdminDashboard
      cities={cities}
      areas={areas}
      masjids={masjids}
      users={users}
    />
  );
}
