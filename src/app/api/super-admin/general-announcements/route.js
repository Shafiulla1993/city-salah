// src/app/api/super-admin/general-announcements/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";
import City from "@/models/City";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";
import mongoose from "mongoose";

// helpers
const one = (v) => (Array.isArray(v) ? v[0] : v);
const normalizeIds = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  try {
    const p = JSON.parse(v);
    if (Array.isArray(p)) return p.map(String);
  } catch {}
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

async function validateIds(raw, Model) {
  const ids = normalizeIds(raw);
  if (!ids.length) return [];
  const found = await Model.find({ _id: { $in: ids } })
    .select("_id")
    .lean();
  return found.map((d) => d._id);
}

/* =========================
   GET – List
========================= */
export const GET = withAuth("super_admin", async (req) => {
  const q = Object.fromEntries(req.nextUrl.searchParams.entries());
  const filter = {};

  if (q.search) {
    filter.$or = [
      { title: new RegExp(q.search, "i") },
      { body: new RegExp(q.search, "i") },
    ];
  }

  const now = new Date();
  if (q.status === "active") {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  }

  const data = await GeneralAnnouncement.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return Response.json({ success: true, data });
});

/* =========================
   POST – Create Draft / Publish
========================= */
export const POST = withAuth("super_admin", async (req, { user }) => {
  const { fields } = await parseMultipart(req);

  const title = one(fields.title);
  const body = one(fields.body);
  const startDate = new Date(one(fields.startDate));
  const endDate = new Date(one(fields.endDate));
  const status = one(fields.status) || "draft";

  const doc = await GeneralAnnouncement.create({
    title,
    body,
    startDate,
    endDate,
    status,
    cities: await validateIds(fields["cities[]"], City),
    areas: await validateIds(fields["areas[]"], Area),
    masjids: await validateIds(fields["masjids[]"], Masjid),
    images: normalizeIds(fields.images),
    createdBy: user._id,
  });

  return Response.json({ success: true, data: doc }, { status: 201 });
});
