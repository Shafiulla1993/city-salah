"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { mAdminAPI } from "@/lib/api/mAdmin";
import { notify } from "@/lib/toast";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerTimingsForm from "./PrayerTimingsForm";

export default function EditMasjidModal({
  open,
  onClose,
  masjidId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);

  const initialState = {
    image: null,
    imageUrl: "",
    contacts: {},
    prayerTimings: {},
  };

  const [form, setForm] = useState(initialState);
  const [hasChanges, setHasChanges] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ------------ LOAD MASJID DETAILS ------------
  async function loadMasjid() {
    if (!masjidId) return;
    setLoading(true);
    try {
      const res = await mAdminAPI.getMasjidById(masjidId);
      const m = res?.data;
      if (!m) return;

      setForm({
        image: null,
        imageUrl: m.imageUrl || "",
        contacts: {
          imam: m.contacts?.find((c) => c.role === "imam") || {},
          mozin: m.contacts?.find((c) => c.role === "mozin") || {},
          mutawalli: m.contacts?.find((c) => c.role === "mutawalli") || {},
        },
        prayerTimings: m.prayerTimings?.[0] || {},
      });
    } catch {
      notify.error("Failed to load masjid");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) loadMasjid();
  }, [open, masjidId]);

  // ------------ AUTO NORMALIZE TIME FORMAT ------------
  function normalizeTime(raw, prayer) {
    if (!raw) return "";
    let str = raw.toString().toUpperCase().trim();
    str = str.replace(/\./g, ":").replace(/AM|PM/g, "").trim();
    let [hh, mm] = str.split(":");
    if (!mm) mm = "00";

    let h = parseInt(hh) || 0;
    let m = parseInt(mm) || 0;

    if (h <= 0) h = 12;
    if (h > 12) h = h % 12 || 12;
    if (m < 0) m = 0;
    if (m > 59) m = m % 60;

    const hhFmt = String(h).padStart(2, "0");
    const mmFmt = String(m).padStart(2, "0");
    const suffix = prayer === "fajr" ? "AM" : "PM";
    return `${hhFmt}:${mmFmt} ${suffix}`;
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // 🔹 Image upload (if changed)
      if (form.image) {
        formData.append("image", form.image);
      }

      // 🔹 Contacts [imam, mozin, mutawalli]
      const contactsArray = [
        form.contacts.imam?.name
          ? { role: "imam", ...form.contacts.imam }
          : null,
        form.contacts.mozin?.name
          ? { role: "mozin", ...form.contacts.mozin }
          : null,
        form.contacts.mutawalli?.name
          ? { role: "mutawalli", ...form.contacts.mutawalli }
          : null,
      ].filter(Boolean);
      formData.append("contacts", JSON.stringify(contactsArray));

      console.log("IMAGE FILE:", form.image);

      // 🔹 Prayer timings (backend will normalize automatically)
      formData.append("prayerTimings", JSON.stringify([form.prayerTimings]));

      const res = await mAdminAPI.updateMasjid(masjidId, formData);

      if (!res.success) throw new Error(res.message);
      notify.success("Masjid updated successfully");

      onUpdated?.(res.data); // Refresh table
      onClose();
    } catch (err) {
      notify.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  // ------------ SUBMIT ------------
  function detectChanges(loaded, current) {
    // image changed
    if (current.image) return true;

    // contacts changed
    const cOld = JSON.stringify([
      ...(loaded.contacts.imam?.name
        ? [{ role: "imam", ...loaded.contacts.imam }]
        : []),
      ...(loaded.contacts.mozin?.name
        ? [{ role: "mozin", ...loaded.contacts.mozin }]
        : []),
      ...(loaded.contacts.mutawalli?.name
        ? [{ role: "mutawalli", ...loaded.contacts.mutawalli }]
        : []),
    ]);

    const cNew = JSON.stringify([
      ...(current.contacts.imam?.name
        ? [{ role: "imam", ...current.contacts.imam }]
        : []),
      ...(current.contacts.mozin?.name
        ? [{ role: "mozin", ...current.contacts.mozin }]
        : []),
      ...(current.contacts.mutawalli?.name
        ? [{ role: "mutawalli", ...current.contacts.mutawalli }]
        : []),
    ]);

    if (cOld !== cNew) return true;

    // timings changed
    const clean = (pt) =>
      JSON.stringify({
        fajr: pt.fajr || {},
        Zohar: pt.Zohar || {},
        asr: pt.asr || {},
        maghrib: pt.maghrib || {},
        isha: pt.isha || {},
        juma: pt.juma || {},
      });

    if (clean(loaded.prayerTimings) !== clean(current.prayerTimings))
      return true;

    return false;
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Masjid" size="2xl">
      {!open || loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          {/* IMAGE */}
          <div>
            <label className="mb-1 font-medium block">Image</label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                className="w-full max-h-40 object-cover rounded mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update("image", e.target.files?.[0] || null)}
            />
          </div>

          {/* CONTACTS */}
          <ContactPersonsForm
            contacts={form.contacts}
            onChange={(v) => update("contacts", v)}
          />

          {/* PRAYER TIMINGS */}
          <PrayerTimingsForm
            value={form.prayerTimings}
            onChange={(v) => update("prayerTimings", v)}
          />

          {/* BUTTONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
