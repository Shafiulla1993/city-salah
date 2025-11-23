// src/components/admin/AdminTable.js

"use client";

export default function AdminTable({ columns = [], data = [] }) {
  if (!data?.length) {
    return <div className="text-center py-6 text-gray-500">No records found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
      <table className="w-full text-sm">
        <thead className="bg-slate-200/70 text-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 text-left">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-100 transition">
              {columns.map((col, cIdx) => (
                <td key={cIdx} className="px-4 py-3">
                  {typeof col.render === "function" ? col.render(row) : row[col.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
