// src/app/dashboard/super-admin/manage/modules/users/UsersTable.js
"use client";

import React, { useState } from "react";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import AdminButton from "@/components/admin/AdminButton";

export default function UsersTable({ users, onUserUpdated, onUserDeleted }) {
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-200/70 text-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Area</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-100 transition">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.phone}</td>
                <td className="px-4 py-3">{u.email ?? "-"}</td>
                <td className="px-4 py-3">{u.city?.name ?? "-"}</td>
                <td className="px-4 py-3">{u.area?.name ?? "-"}</td>
                <td className="px-4 py-3 uppercase text-xs">{u.role}</td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800" onClick={() => setEditId(u._id)}>
                    Edit
                  </button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700" onClick={() => setDelId(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <EditUserModal
        open={!!editId}
        onClose={() => setEditId(null)}
        userId={editId}
        onUpdated={(updated) => {
          onUserUpdated?.(updated);
          setEditId(null);
        }}
      />

      <DeleteUserModal
        open={!!delId}
        onClose={() => setDelId(null)}
        userId={delId}
        onDeleted={(id) => {
          onUserDeleted?.(id);
          setDelId(null);
        }}
      />
    </div>
  );
}
