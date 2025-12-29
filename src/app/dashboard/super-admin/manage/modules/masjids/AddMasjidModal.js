// src/app/dashboard/super-admin/manage/modules/masjids/AddMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";
import MasjidForm from "./MasjidForm";

export default function AddMasjidModal({
  open,
  onClose,
  onCreated,
  cities = [],
  areas = [],
}) {
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [prayerRules, setPrayerRules] = useState({});

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

  const [image, setImage] = useState({ url: "", publicId: "" });

  async function onImageSelect(file) {
    if (!file) return;

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("image", file);

      const res = await adminAPI.uploadMasjidImage(fd);
      setImage({
        url: res.data.imageUrl,
        publicId: res.data.imagePublicId,
      });
    } catch {
      notify.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.name || !form.city || !form.area || !form.lat || !form.lng) {
      return notify.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        area: form.area,
        ladiesPrayerFacility: form.ladiesPrayerFacility,
        imageUrl: image.url,
        imagePublicId: image.publicId,
        location: {
          type: "Point",
          coordinates: [Number(form.lng), Number(form.lat)],
        },
        contacts: Object.entries(form.contacts)
          .filter(([, v]) => v?.name)
          .map(([role, v]) => ({ role, ...v })),
      };

      const res = await adminAPI.createMasjid(payload);
      const masjidId = res.data._id;

      for (const [prayer, rule] of Object.entries(prayerRules)) {
        if (!rule?.mode) continue;
        await adminAPI.upsertMasjidPrayerRule(masjidId, {
          prayer,
          mode: rule.mode,
          manual: rule.manual,
          auto: rule.auto,
        });
      }

      notify.success("Masjid created");
      onCreated?.();
      onClose();
    } catch {
      notify.error("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Masjid"
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
            {loading ? "Saving..." : "Create Masjid"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
