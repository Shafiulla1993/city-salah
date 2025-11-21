// src/components/DynamicForm.js
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api/sAdmin";

/**
 * DynamicForm supports:
 * - add: when no id
 * - edit: when id present
 * - view: when ?view=true
 *
 * Accepts either `props.type` or reads from route params.
 */
export default function DynamicForm(props) {
  const params = useParams() || {};
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = props.type || params.type; // 'cities'|'areas'|'masjids'|'users'
  const id = props.id || params.id;
  const isEdit = Boolean(id) && id !== "add";
  const isView = searchParams?.get?.("view") === "true" || props.view === true;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    area: "",
    address: "",
    email: "",
    phone: "",
  });

  if (!type) {
    return <div className="p-4 text-red-600">Missing type in DynamicForm</div>;
  }

  // map single-get functions (plural type -> single-get)
  const singleGet = {
    cities: adminAPI.getCityById,
    areas: adminAPI.getAreaById,
    masjids: adminAPI.getMasjidById,
    users: adminAPI.getUserById,
  };

  // create/update functions
  const createFns = {
    cities: adminAPI.createCity,
    areas: adminAPI.createArea,
    masjids: adminAPI.createMasjid,
    users: adminAPI.createUser,
  };

  const updateFns = {
    cities: adminAPI.updateCity,
    areas: adminAPI.updateArea,
    masjids: adminAPI.updateMasjid,
    users: adminAPI.updateUser,
  };

  // load existing item for edit/view
  useEffect(() => {
    async function load() {
      if (!isEdit) return;
      setLoading(true);
      try {
        const fn = singleGet[type];
        let res = null;
        if (typeof fn === "function") {
          res = await fn(id);
        } else {
          // fallback: fetch list and find by id
          const listRes = await (type === "cities"
            ? adminAPI.getCities()
            : type === "areas"
            ? adminAPI.getAreas()
            : type === "masjids"
            ? adminAPI.getMasjids()
            : adminAPI.getUsers());
          const list = listRes?.data ?? listRes ?? [];
          res = Array.isArray(list)
            ? list.find((it) => String(it._id) === String(id))
            : null;
        }

        const item = res?.data ?? res ?? null;
        if (item) {
          setForm({
            name: item.name,
            city: item.city,
            area: item.area,
            address: item.address,
            email: item.email,
            phone: item.phone,
            ...item,
          });
        }
      } catch (err) {
        console.error("DynamicForm load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isView) return;

    try {
      setLoading(true);
      if (isEdit) {
        const fn = updateFns[type];
        if (typeof fn !== "function")
          throw new Error("Update function not available for " + type);
        await fn(id, form);
        alert("Updated successfully");
      } else {
        const fn = createFns[type];
        if (typeof fn !== "function")
          throw new Error("Create function not available for " + type);
        await fn(form);
        alert("Created successfully");
      }
      router.push("/dashboard/super-admin");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white rounded-xl p-6 shadow space-y-4"
    >
      <h2 className="text-2xl font-bold mb-2 capitalize">
        {isView ? "View" : isEdit ? "Edit" : "Add"} {type.replace(/s$/, "")}
      </h2>

      {/* Name */}
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          name="name"
          value={form.name ?? ""}
          onChange={handleChange}
          disabled={isView}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* City (for area/masjid/user) */}
      {["areas", "masjids", "users"].includes(type) && (
        <div>
          <label className="block mb-1 font-medium">City</label>
          <input
            name="city"
            value={form.city ?? ""}
            onChange={handleChange}
            disabled={isView}
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {/* Area (for masjid/user) */}
      {["masjids", "users"].includes(type) && (
        <div>
          <label className="block mb-1 font-medium">Area</label>
          <input
            name="area"
            value={form.area ?? ""}
            onChange={handleChange}
            disabled={isView}
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {/* Address (masjid) */}
      {type === "masjids" && (
        <div>
          <label className="block mb-1 font-medium">Address</label>
          <input
            name="address"
            value={form.address ?? ""}
            onChange={handleChange}
            disabled={isView}
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {/* User specific */}
      {type === "users" && (
        <>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              value={form.email ?? ""}
              onChange={handleChange}
              disabled={isView}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone ?? ""}
              onChange={handleChange}
              disabled={isView}
              className="w-full border p-2 rounded"
            />
          </div>
        </>
      )}

      {!isView && (
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      )}
    </form>
  );
}
