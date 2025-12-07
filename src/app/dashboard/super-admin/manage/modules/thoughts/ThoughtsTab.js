// src/app/dashboard/super-admin/manage/modules/thoughts/ThoughtsTab.js
"use client";

import { useState, useEffect } from "react";
import { notify } from "@/lib/toast";
import ThoughtsTable from "./ThoughtsTable";
import ThoughtsSkeleton from "./ThoughtsSkeleton";
import { adminAPI } from "@/lib/api/sAdmin";
import AddThoughtModal from "./AddThoughtModal";
import EditThoughtModal from "./EditThoughtModal";
import DeleteThoughtModal from "./DeleteThoughtModal";
import { useInfiniteThoughts } from "./useInfiniteThoughts";

export default function ThoughtsTab() {
  const {
    thoughts,
    loading,
    hasMore,
    loadNext,
    setObserverRef,
    resetAndLoad,
    setSearch,
    search,
  } = useInfiniteThoughts();

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    resetAndLoad();
  }, []);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => resetAndLoad()}
          placeholder="Search thought..."
          className="px-3 py-2 border rounded-lg text-sm w-64"
        />

        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg"
        >
          + Add Thought
        </button>
      </div>

      {/* TABLE */}
      {loading && thoughts.length === 0 ? (
        <ThoughtsSkeleton />
      ) : (
        <ThoughtsTable
          thoughts={thoughts}
          onEdit={(id) => setEditId(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div
          ref={setObserverRef}
          className="h-10 flex justify-center items-center text-gray-400"
        >
          Loading more…
        </div>
      )}

      {/* MODALS */}
      <AddThoughtModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => resetAndLoad()}
      />

      <EditThoughtModal
        open={!!editId}
        onClose={() => setEditId(null)}
        thoughtId={editId}
        onUpdated={() => resetAndLoad()}
      />

      <DeleteThoughtModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        thoughtId={deleteId}
        onDeleted={() => resetAndLoad()}
      />
    </div>
  );
}
