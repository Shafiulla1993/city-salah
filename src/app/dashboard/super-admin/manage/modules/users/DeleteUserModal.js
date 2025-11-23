// src/app/dashboard/super-admin/manage/modules/users/DeleteUserModal.js

"use client";

import React from "react";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function DeleteUserModal({ open, onClose, userId, onDeleted }) {
  async function confirmDelete() {
    try {
      const res = await adminAPI.deleteUser(userId);
      if (res?.success) {
        notify.success("User deleted");
        onDeleted?.(userId);
      } else {
        notify.error(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete user");
    } finally {
      onClose?.();
    }
  }

  return (
    <DeleteConfirm
      open={open}
      onClose={onClose}
      onConfirm={confirmDelete}
      title="Delete user"
      message="Are you sure you want to delete this user?"
    />
  );
}
