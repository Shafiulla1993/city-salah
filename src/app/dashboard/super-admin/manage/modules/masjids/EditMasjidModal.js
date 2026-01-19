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

  const [localCities, setLocalCities] = useState([]);
  const [localAreas, setLocalAreas] = useState([]);

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

    (async () => {
      const [cRes, aRes] = await Promise.all([
        fetch("/api/super-admin/cities", { credentials: "include" }).then((r) =>
          r.json(),
        ),
        fetch("/api/super-admin/areas", { credentials: "include" }).then((r) =>
          r.json(),
        ),
      ]);

      setLocalCities(cRes.data || []);
      setLocalAreas(aRes.data || []);
    })();
  }, [open]);

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
          name: m.name || "",
          address: m.address || "",
          city: m.city?._id || "",
          area: m.area?._id || "",
          lat: m.location?.coordinates?.[1] || "",
          lng: m.location?.coordinates?.[0] || "",
          ladiesPrayerFacility: Boolean(m.ladiesPrayerFacility),
          contacts: Object.fromEntries(
            (m.contacts || []).map((c) => [c.role, c]),
          ),
        });

        setImage({
          url: m.imageUrl || "",
          publicId: m.imagePublicId || "",
        });

        const normalized = {};
        (rRes.data?.rules || []).forEach((r) => {
          normalized[r.prayer] = {
            mode: r.mode,
            manual: r.manual,
            auto: r.auto,
          };
        });
        setPrayerRules(normalized);
      } catch (err) {
        console.error(err);
        notify.error("Failed to load masjid");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, masjidId]);

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

  async function onImageSelect(file) {
    if (!file) return;

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/super-admin/masjids/upload-image", {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    const json = await res.json();
    setImage({
      url: json.data.imageUrl,
      publicId: json.data.imagePublicId,
    });
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
          contacts: Object.entries(form.contacts || {}).map(([role, v]) => ({
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
    } catch (err) {
      console.error(err);
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
