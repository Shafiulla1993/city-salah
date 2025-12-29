// src/app/dashboard/masjid-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
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

  useEffect(() => {
    if (!open || !masjidId) return;

    (async () => {
      try {
        setLoading(true);

        const [mRes, rRes] = await Promise.all([
          adminAPI.getMasjidById(masjidId),
          adminAPI.getMasjidPrayerRules(masjidId),
        ]);

        const m = mRes.data;

        setForm({
          name: m.name,
          address: m.address,
          city: m.city?._id,
          area: m.area?._id,
          lat: m.location?.coordinates?.[1],
          lng: m.location?.coordinates?.[0],
          ladiesPrayerFacility: Boolean(m.ladiesPrayerFacility),
          contacts: Object.fromEntries(
            m.contacts?.map((c) => [c.role, c]) || []
          ),
        });

        setImage({
          url: m.imageUrl || "",
          publicId: m.imagePublicId || "",
        });

        const normalized = {};
        rRes.data.rules?.forEach((r) => {
          normalized[r.prayer] = {
            mode: r.mode,
            manual: r.manual || {},
            auto: r.auto || {},
          };
        });

        setPrayerRules(normalized);
      } catch {
        notify.error("Failed to load masjid");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, masjidId]);

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

    try {
      setLoading(true);

      await adminAPI.updateMasjid(masjidId, {
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
      });

      for (const [prayer, rule] of Object.entries(prayerRules)) {
        if (!rule?.mode) continue;
        await adminAPI.upsertMasjidPrayerRule(masjidId, {
          prayer,
          mode: rule.mode,
          manual: rule.manual,
          auto: rule.auto,
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
