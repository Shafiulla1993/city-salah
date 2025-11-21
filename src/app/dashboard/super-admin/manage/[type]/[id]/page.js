// src/app/dashboard/super-admin/manage/[type]/[id]/page.js
"use client";

import React from "react";
import DynamicForm from "@/components//sAdminDashbaord/DynamicForm";
import { useParams, useSearchParams } from "next/navigation";

export default function ManageItemPage() {
  const params = useParams() || {};
  const searchParams = useSearchParams();
  const type = params.type;
  const id = params.id;

  // If you want the page to render read-only view when ?view=true,
  // DynamicForm will handle view mode automatically.
  return (
    <div className="p-4">
      <DynamicForm type={type} id={id} />
    </div>
  );
}
