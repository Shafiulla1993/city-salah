// src/app/dashboard/super-admin/manage/tabs/UsersTab.js
"use client";

import { useEffect, useState, useRef } from "react";
import { adminAPI } from "@/lib/api/sAdmin";
import UsersTable from "../modules/users/UsersTable";
import UsersSkeleton from "../modules/users/UsersSkeleton";

export default function UsersTab() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");

  const loaderRef = useRef();

  async function loadUsers(pageToLoad = page) {
    if (loading || !hasMore) return;
    if (pageToLoad === 1 && users.length > 0) return; // 🚫 stop double load

    setLoading(true);

    try {
      const res = await adminAPI.getUsers(
        `?page=${pageToLoad}&limit=10&sort=${sort}&search=${search}`
      );

      const newData = res?.data ?? [];

      if (newData.length < 10) setHasMore(false);

      setUsers((prev) => {
        const merged = [...prev, ...newData];
        // remove duplicates
        return Array.from(new Map(merged.map((u) => [u._id, u])).values());
      });
    } finally {
      setLoading(false);
    }
  }

  // reset when filters change
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
  }, [sort, search]);

  // load when page changes
  useEffect(() => {
    loadUsers();
  }, [page]);

  async function loadUsers() {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await adminAPI.getUsers(
        `?page=${page}&limit=10&sort=${sort}&search=${search}`
      );

      const newData = res?.data ?? [];

      if (newData.length < 10) setHasMore(false);

      setUsers((prev) => {
        const merged = [...prev, ...newData];

        // Remove duplicates by `_id`
        return Array.from(new Map(merged.map((u) => [u._id, u])).values());
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loaderRef, hasMore, loading]);

  function handleSortChange(e) {
    setSort(e.target.value);
    setPage(1);
    setUsers([]);
    setHasMore(true);
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
    setUsers([]);
    setHasMore(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Manage Users</h2>

        <button className="btn btn-primary btn-sm">+ Create User</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          placeholder="Search by name"
          value={search}
          onChange={handleSearchChange}
          className="border px-3 py-2 rounded-lg"
        />

        <select
          value={sort}
          onChange={handleSortChange}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <UsersTable
          users={users}
          onUserDeleted={(id) => {
            setUsers((prev) => prev.filter((u) => u._id !== id));
          }}
          onUserUpdated={(updated) => {
            setUsers((prev) =>
              prev.map((u) => (u._id === updated._id ? updated : u))
            );
          }}
        />

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading
            ? "Loading..."
            : hasMore
            ? "Scroll to load more"
            : "No more users"}
        </div>
      </div>
    </div>
  );
}
