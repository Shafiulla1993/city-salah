// src/app/dashboard/super-admin/manage/modules/users/UsersTable.js
"use client";

import { useState } from "react";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

export default function UsersTable({ users = [], onUserUpdated }) {
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  if (!users.length) {
    return <p className="text-center text-gray-500 py-6">No users found</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Area</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Masjids</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.city?.name || "-"}</td>
                <td className="px-4 py-3">{u.area?.name || "-"}</td>
                <td className="px-4 py-3 capitalize">
                  {u.role.replace("_", " ")}
                </td>

                <td className="px-4 py-3">
                  {u.role === "masjid_admin" &&
                  Array.isArray(u.masjidId) &&
                  u.masjidId.length
                    ? u.masjidId.map((m) => m.name).join(", ")
                    : "-"}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() => setEditId(u._id)}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    onClick={() => setDeleteId(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editId && (
        <EditUserModal
          open
          userId={editId}
          onClose={() => setEditId(null)}
          onUpdated={() => {
            setEditId(null);
            onUserUpdated?.();
          }}
        />
      )}

      {deleteId && (
        <DeleteUserModal
          open
          userId={deleteId}
          onClose={() => setDeleteId(null)}
          onDeleted={() => {
            setDeleteId(null);
            onUserUpdated?.();
          }}
        />
      )}
    </div>
  );
}
