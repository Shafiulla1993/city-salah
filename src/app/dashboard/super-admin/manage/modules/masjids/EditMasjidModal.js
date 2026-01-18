// src/app/dashboard/super-admin/manage/modules/masjids/EditMasjidModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import MasjidForm from "./MasjidForm";

export default function EditMasjidModal({
  open,
  onClose,
  masjidId,
  onUpdated,
  cities = [],
  areas = [],
}) {
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [prayerRules, setPrayerRules] = useState({});
  const [image, setImage] = useState({ url: "", publicId: "" });
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    area: "",
    lat: "",
    lng: "",
    contacts: {},
    ladiesPrayerFacility: false,
  });

  useEffect(() => {
    if (!open || !masjidId) return;

    (async () => {
      try {
        setLoading(true);
        const [mRes, rRes] = await Promise.all([
          fetch(`/api/super-admin/masjids/${masjidId}`, {
            credentials: "include",
          }).then((r) => r.json()),
          fetch(`/api/super-admin/masjids/${masjidId}/prayer-rules`, {
            credentials: "include",
          }).then((r) => r.json()),
        ]);

        const m = mRes.data;

        setForm({
          name: m.name,
          address: m.address,
          city: m.city?._id,
          area: m.area?._id,
          lat: m.location.coordinates[1],
          lng: m.location.coordinates[0],
          ladiesPrayerFacility: Boolean(m.ladiesPrayerFacility),
          contacts: Object.fromEntries(m.contacts.map((c) => [c.role, c])),
        });

        setImage({ url: m.imageUrl, publicId: m.imagePublicId });

        const normalized = {};
        rRes.data.rules.forEach((r) => {
          normalized[r.prayer] = {
            mode: r.mode,
            manual: r.manual,
            auto: r.auto,
          };
        });
        setPrayerRules(normalized);
      } catch {
        notify.error("Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, masjidId]);

  async function onImageSelect(file) {
    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/super-admin/masjids/upload-image", {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    const json = await res.json();
    setImage({ url: json.data.imageUrl, publicId: json.data.imagePublicId });
  }

  async function submit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await fetch(`/api/super-admin/masjids/${masjidId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({
          ...form,
          imageUrl: image.url,
          imagePublicId: image.publicId,
          location: {
            type: "Point",
            coordinates: [Number(form.lng), Number(form.lat)],
          },
          contacts: Object.entries(form.contacts).map(([role, v]) => ({
            role,
            ...v,
          })),
        }),
      });

      for (const [prayer, rule] of Object.entries(prayerRules)) {
        await fetch(`/api/super-admin/masjids/${masjidId}/prayer-rules`, {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ prayer, ...rule }),
        });
      }

      notify.success("Masjid updated");
      onUpdated?.();
      onClose();
    } catch {
      notify.error("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Masjid"
      closeOnBackdrop={false}
    >
      <form onSubmit={submit} className="flex flex-col h-full">
        <MasjidForm
          form={form}
          setForm={setForm}
          prayerRules={prayerRules}
          setPrayerRules={setPrayerRules}
          cities={cities}
          areas={areas}
          image={image}
          onImageSelect={onImageSelect}
          mapOpen={mapOpen}
          setMapOpen={setMapOpen}
        />
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={loading}
            className="bg-slate-700 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
