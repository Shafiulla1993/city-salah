// src/app/dashboard/super-admin/manage/modules/masjids/AddMasjidModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
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
  const [image, setImage] = useState({ url: "", publicId: "" });

  const [localCities, setLocalCities] = useState(cities);
  const [localAreas, setLocalAreas] = useState(areas);

  const emptyForm = {
    name: "",
    address: "",
    city: "",
    area: "",
    lat: "",
    lng: "",
    contacts: {},
    ladiesPrayerFacility: false,
  };

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
    if (!open) return;

    setForm(emptyForm);
    setImage({ url: "", publicId: "" });
    setPrayerRules({});
    setMapOpen(false);
  }, [open]);

  useEffect(() => {
    setLocalCities(cities);
    setLocalAreas(areas);
  }, [cities, areas]);

  async function refreshCities(selectId) {
    const res = await fetch("/api/super-admin/cities", {
      credentials: "include",
    });
    const json = await res.json();
    setLocalCities(json.data || []);
    if (selectId) setForm((s) => ({ ...s, city: selectId }));
  }

  async function refreshAreas(cityId, selectId) {
    const res = await fetch(`/api/super-admin/areas?city=${cityId}`, {
      credentials: "include",
    });
    const json = await res.json();
    setLocalAreas(json.data || []);
    if (selectId) setForm((s) => ({ ...s, area: selectId }));
  }

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/super-admin/masjids/upload-image", {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    const json = await res.json();
    return json.data;
  }

  async function onImageSelect(file) {
    if (!file) return;
    try {
      setLoading(true);
      const data = await uploadImage(file);
      setImage({ url: data.imageUrl, publicId: data.imagePublicId });
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

      const res = await fetch("/api/super-admin/masjids", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          ...form,
          imageUrl: image.url,
          imagePublicId: image.publicId,
          location: {
            type: "Point",
            coordinates: [Number(form.lng), Number(form.lat)],
          },
          contacts: Object.entries(form.contacts)
            .filter(([, v]) => v?.name)
            .map(([role, v]) => ({ role, ...v })),
        }),
      });

      const json = await res.json();
      const masjidId = json.data._id;

      for (const [prayer, rule] of Object.entries(prayerRules)) {
        await fetch(`/api/super-admin/masjids/${masjidId}/prayer-rules`, {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ prayer, ...rule }),
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
          cities={localCities}
          areas={localAreas}
          image={image}
          onImageSelect={onImageSelect}
          mapOpen={mapOpen}
          setMapOpen={setMapOpen}
          onCityAdded={(id) => refreshCities(id)}
          onAreaAdded={(cityId, areaId) => refreshAreas(cityId, areaId)}
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
