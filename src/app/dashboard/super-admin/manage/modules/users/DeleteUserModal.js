// src/app/dashboard/super-admin/manage/modules/users/DeleteUserModal.js

"use client";

import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { notify } from "@/lib/toast";

export default function DeleteUserModal({ open, onClose, userId, onDeleted }) {
  async function confirmDelete() {
    const res = await fetch(`/api/super-admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();

    if (json.success) {
      notify.success("User deleted");
      onDeleted?.(userId);
    } else notify.error(json.message || "Delete failed");

    onClose();
  }

  return (
    <DeleteConfirm
      open={open}
      onClose={onClose}
      onConfirm={confirmDelete}
      title="Delete User"
      message="Are you sure you want to delete this user?"
    />
  );
}
