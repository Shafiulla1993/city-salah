// src/app/dashboard/super-admin/manage/tabs/UsersTab.js
"use client";

import { useEffect, useRef, useState } from "react";
import UsersTable from "../modules/users/UsersTable";
import UsersSkeleton from "../modules/users/UsersSkeleton";
import AddUserModal from "../modules/users/AddUserModal";
import EditUserModal from "../modules/users/EditUserModal";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const loaderRef = useRef(null);

  async function loadPage(p = 1, reset = false) {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/super-admin/users?page=${p}&limit=10&sort=${sort}&search=${search}`,
        { credentials: "include" },
      );
      const json = await res.json();
      const rows = json?.data || [];

      if (reset) setUsers(rows);
      else {
        setUsers((prev) => {
          const map = new Map();
          [...prev, ...rows].forEach((u) => map.set(u._id, u));
          return [...map.values()];
        });
      }

      setHasMore(rows.length === 10);
      setPage(p);
    } catch (err) {
      console.error("Load users failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1, true);
  }, [sort, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPage(page + 1);
        }
      },
      { rootMargin: "300px" },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setAddOpen(true)}
        >
          + Create User
        </button>
      </div>

      <div className="flex gap-3">
        <input
          className="border px-3 py-2 rounded-lg"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded-lg"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {loading && users.length === 0 ? (
          <UsersSkeleton />
        ) : (
          <UsersTable
            users={users}
            onEdit={(id) => setEditId(id)}
            onDeleted={(id) =>
              setUsers((prev) => prev.filter((u) => u._id !== id))
            }
            onUpdated={(u) =>
              setUsers((prev) => prev.map((x) => (x._id === u._id ? u : x)))
            }
          />
        )}

        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
              ? "Scroll to load more"
              : "No more users"}
        </div>
      </div>

      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => loadPage(1, true)}
      />

      <EditUserModal
        open={!!editId}
        userId={editId}
        onClose={() => setEditId(null)}
        onUpdated={(u) => {
          setUsers((prev) => prev.map((x) => (x._id === u._id ? u : x)));
          setEditId(null);
        }}
      />
    </div>
  );
}
