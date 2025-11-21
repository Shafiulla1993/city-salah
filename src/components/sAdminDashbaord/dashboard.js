// src/components/sAdminDashboard/dashboard.js
"use client";

import React, { useState } from "react";
import DashboardCard from "./card";
import DeleteModal from "./DeleteModal";
import ViewModal from "./ViewModal";

/**
 * Props:
 *  - cities, areas, masjids, users (arrays)
 */
export default function SuperAdminDashboard({
  cities = [],
  areas = [],
  masjids = [],
  users = [],
}) {
  const [deleteItem, setDeleteItem] = useState(null); // { item, type }
  const [viewItem, setViewItem] = useState(null); // { item, type }

  // Called after delete to update UI (optional - simply reloads)
  function handleDeleted() {
    // quick approach: reload page to refresh lists (or you can remove item from local state)
    window.location.reload();
  }

  return (
    <>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Cities"
          type="cities"
          count={cities.length}
          items={cities}
          onDelete={(item) => setDeleteItem({ item, type: "cities" })}
          onView={(item) => setViewItem({ item, type: "cities" })}
        />

        <DashboardCard
          title="Areas"
          type="areas"
          count={areas.length}
          items={areas}
          onDelete={(item) => setDeleteItem({ item, type: "areas" })}
          onView={(item) => setViewItem({ item, type: "areas" })}
        />

        <DashboardCard
          title="Masjids"
          type="masjids"
          count={masjids.length}
          items={masjids}
          onDelete={(item) => setDeleteItem({ item, type: "masjids" })}
          onView={(item) => setViewItem({ item, type: "masjids" })}
        />

        <DashboardCard
          title="Users"
          type="users"
          count={users.length}
          items={users}
          onDelete={(item) => setDeleteItem({ item, type: "users" })}
          onView={(item) => setViewItem({ item, type: "users" })}
        />
      </div>

      {deleteItem && (
        <DeleteModal
          item={deleteItem.item}
          type={deleteItem.type}
          onClose={() => setDeleteItem(null)}
          onDeleted={handleDeleted}
        />
      )}

      {viewItem && (
        <ViewModal
          item={viewItem.item}
          type={viewItem.type}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
