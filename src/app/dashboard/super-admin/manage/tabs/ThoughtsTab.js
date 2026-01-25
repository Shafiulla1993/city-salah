// src/app/dashboard/super-admin/manage/tabs/ThoughtsTab.js
"use client";

import { useEffect, useState } from "react";
import ThoughtsTable from "../modules/thoughts/ThoughtsTable";
import ThoughtsSkeleton from "../modules/thoughts/ThoughtsSkeleton";
import AddThoughtModal from "../modules/thoughts/AddThoughtModal";
import EditThoughtModal from "../modules/thoughts/EditThoughtModal";
import DeleteThoughtModal from "../modules/thoughts/DeleteThoughtModal";

export default function ThoughtsTab() {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    const q = status ? `?status=${status}` : "";
    const res = await fetch(`/api/super-admin/thoughts${q}`, {
      credentials: "include",
    });
    const data = await res.json();
    setThoughts(data?.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <select
            className="border rounded px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="published">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-slate-700 text-white rounded"
        >
          + Add Thought
        </button>
      </div>

      {loading ? (
        <ThoughtsSkeleton />
      ) : (
        <ThoughtsTable
          thoughts={thoughts}
          onEdit={(id) => setEditId(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <AddThoughtModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={load}
      />

      <EditThoughtModal
        open={!!editId}
        thoughtId={editId}
        onClose={() => setEditId(null)}
        onUpdated={load}
      />

      <DeleteThoughtModal
        open={!!deleteId}
        thoughtId={deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={load}
      />
    </div>
  );
}
