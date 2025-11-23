// src/app/dashboard/super-admin/manage/tabs/UsersTab.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import UsersTable from "../modules/users/UsersTable";
import UsersSkeleton from "../modules/users/UsersSkeleton";
import AddUserModal from "../modules/users/AddUserModal";
import { useInfiniteUsers } from "../modules/users/useInfiniteUsers";
import { notify } from "@/lib/toast";

export default function UsersTab() {
  const [createOpen, setCreateOpen] = useState(false);
  const {
    users,
    loading,
    hasMore,
    loadNext,
    loadFirst,
    setObserverRef,
    resetAndLoad,
    sort,
    setSort,
  } = useInfiniteUsers({ initialSort: "-createdAt", limit: 10 });

  const sentinelRef = useRef(null);

  useEffect(() => {
    // initial load
    loadFirst();
  }, []);

  useEffect(() => {
    setObserverRef(sentinelRef.current);
  }, [sentinelRef.current]);

  function onUserCreated() {
    notify.success("User created");
    resetAndLoad(); // reload from page 1
  }

  function onUserUpdated(updated) {
    // optimistic: replace item in the list
    // We simply reload from first page to be safe
    resetAndLoad();
    notify.success("User updated");
  }

  function onUserDeleted(id) {
    // reload to reflect deletion
    resetAndLoad();
    notify.success("User deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Manage Users</h2>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              resetAndLoad(e.target.value);
            }}
            className="h-10 rounded-md border px-3 bg-slate-100/40"
          >
            <option value="name">Name A→Z</option>
            <option value="-name">Name Z→A</option>
            <option value="city">City</option>
            <option value="area">Area</option>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>

          <AdminButton onClick={() => setCreateOpen(true)}>+ Create User</AdminButton>
        </div>
      </div>

      {users.length === 0 && loading ? (
        <UsersSkeleton />
      ) : (
        <UsersTable
          users={users}
          onUserUpdated={onUserUpdated}
          onUserDeleted={onUserDeleted}
        />
      )}

      <div ref={sentinelRef} className="h-8" />

      {loading && <div className="text-center py-4"><UsersSkeleton rows={3} /></div>}

      {!hasMore && users.length > 0 && (
        <p className="text-center text-gray-500">End of list</p>
      )}

      <AddUserModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={onUserCreated} />
    </div>
  );
}
