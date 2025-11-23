"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import MultiSelect from "@/components/form/MultiSelect";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function EditUserModal({ open, onClose, userId, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [initial, setInitial] = useState(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "public",
        city: "",
        area: "",
        masjidId: [],
    });

    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [masjids, setMasjids] = useState([]);

    useEffect(() => {
        if (!open) return;
        loadAll();
    }, [open]);

    async function loadAll() {
        setLoading(true);
        try {
            const [cRes, aRes, mRes] = await Promise.all([
                adminAPI.getCities(),
                adminAPI.getAreas(),
                adminAPI.getMasjids(),
            ]);
            setCities(cRes?.data ?? []);
            setAreas(aRes?.data ?? []);
            setMasjids(mRes?.data ?? []);

            if (userId) {
                const ures = await adminAPI.getUserById(userId);
                const u = ures?.data;
                if (u) {
                    setInitial(u);
                    setForm({
                        name: u.name || "",
                        phone: u.phone || "",
                        email: u.email || "",
                        password: "",
                        role: u.role || "public",
                        city: u.city?._id || "",
                        area: u.area?._id || "",
                        masjidId: Array.isArray(u.masjidId) ? u.masjidId.map((m) => (typeof m === "object" ? m._id : m)) : [],
                    });
                }
            }
        } catch (err) {
            console.error(err);
            notify.error("Failed to load user");
        } finally {
            setLoading(false);
        }
    }

    function update(k, v) {
        setForm((s) => ({ ...s, [k]: v }));
    }

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            // Build payload with only changed fields
            const payload = {};
            if (form.name !== initial.name) payload.name = form.name;
            if (form.phone !== initial.phone) payload.phone = form.phone;
            if ((form.email || "") !== (initial.email || "")) payload.email = form.email || undefined;
            if (form.password && form.password.trim() !== "") payload.password = form.password;
            if (form.role !== initial.role) payload.role = form.role;
            if (form.city !== (initial.city?._id || "")) payload.city = form.city;
            if (form.area !== (initial.area?._id || "")) payload.area = form.area;
            // masjidId: compare arrays (string ids)
            const initialMasj = (initial.masjidId || []).map((m) => (typeof m === "object" ? m._id : m));
            const newMasj = (form.masjidId || []);
            const sameMasjids = JSON.stringify(initialMasj.sort()) === JSON.stringify(newMasj.sort());
            if (!sameMasjids) payload.masjidId = newMasj;

            // If nothing changed, close
            if (Object.keys(payload).length === 0) {
                notify.info("No changes made");
                onClose();
                setLoading(false);
                return;
            }

            const res = await adminAPI.updateUser(userId, payload);
            if (res?.success) {
                notify.success("User updated");
                onUpdated?.(res?.data);
                onClose();
            } else {
                notify.error(res?.message || "Update failed");
            }
        } catch (err) {
            console.error(err);
            notify.error("Failed to update user");
        } finally {
            setLoading(false);
        }
    }

    // options
    const cityOptions = (cities || []).map((c) => ({ value: c._id, label: c.name }));
    const areaOptions = (areas || [])
        .filter((a) => a.city?._id === form.city)
        .map((a) => ({ value: a._id, label: a.name }));
    const masjidOptions = (masjids || [])
        .filter((m) => {
            // show masjids in selected city/area OR already selected ones
            if (!form.city && !form.area) return true;
            if (form.area) return m.area?._id === form.area || form.masjidId.includes(m._id);
            if (form.city) return m.city?._id === form.city || form.masjidId.includes(m._id);
            return true;
        })
        .map((m) => ({ value: m._id, label: m.name }));

    return (
        <Modal open={open} onClose={onClose} title="Edit user" size="md">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                    <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    <Input label="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                    <Input
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="Leave empty to keep current password"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                        <select value={form.role} onChange={(e) => update("role", e.target.value)} className="w-full h-10 rounded-md border px-3 bg-slate-100/40">
                            <option value="public">Public</option>
                            <option value="masjid_admin">Masjid Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                        <select value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full h-10 rounded-md border px-3 bg-slate-100/40">
                            <option value="">Select city</option>
                            {cityOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Area</label>
                        <select value={form.area} onChange={(e) => update("area", e.target.value)} className="w-full h-10 rounded-md border px-3 bg-slate-100/40">
                            <option value="">Select area</option>
                            {areaOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Masjids</label>
                    {form.role === "masjid_admin" && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Masjids</label>
                            <MultiSelect
                                options={masjidOptions}
                                value={form.masjidId}
                                onChange={(vals) => update("masjidId", vals)}
                                placeholder="Search & add masjids"
                            />
                        </div>
                    )}

                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 text-white">
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
