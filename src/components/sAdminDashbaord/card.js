// src/components/sAdminDashboard/Card.js
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";

export default function DashboardCard({
  title,
  type, // expected: 'cities' | 'areas' | 'masjids' | 'users'
  items = [],
  count = 0,
  onDelete, // fn(item)
  onView, // fn(item)
}) {
  const router = useRouter();

  const addLink = `/dashboard/super-admin/manage/${type}/add`;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col w-full min-w-[250px]">
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-bold">
          {title} ({count})
        </div>

        <button
          onClick={() => router.push(addLink)}
          className="p-1 rounded-full hover:bg-gray-200 transition"
          title={`Add ${title}`}
        >
          <FiPlus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-64 space-y-2">
        {items?.length ? (
          items.map((item) => (
            <div
              key={item._id || item.id || item.name}
              className="flex justify-between items-center p-2 bg-gray-50 rounded-lg shadow-sm"
            >
              <span className="truncate">
                {item.name ?? item.title ?? item._id}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => onView && onView(item)}
                  className="hover:bg-gray-200 p-1 rounded"
                  title="View"
                >
                  <FiEye size={16} />
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/super-admin/manage/${type}/${item._id}`
                    )
                  }
                  className="hover:bg-gray-200 p-1 rounded"
                  title="Edit"
                >
                  <FiEdit size={16} />
                </button>

                <button
                  onClick={() => onDelete && onDelete(item)}
                  className="hover:bg-gray-200 p-1 rounded"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 p-2">No items</div>
        )}
      </div>
    </div>
  );
}
