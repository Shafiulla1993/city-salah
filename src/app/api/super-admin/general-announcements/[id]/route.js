// src/app/api/super-admin/general-announcements/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";
import City from "@/models/City";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";

function extractPublicId(url) {
  // Example:
  // https://res.cloudinary.com/demo/image/upload/v1700000000/announcements/abc123.jpg
  const withoutQuery = url.split("?")[0];
  const parts = withoutQuery.split("/");

  const filename = parts.pop(); // abc123.jpg
  const folder = parts.pop(); // announcements
  const name = filename.split(".")[0]; // abc123

  return folder ? `${folder}/${name}` : name;
}

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

export const GET = withAuth("super_admin", async (req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id))
    return Response.json({ success: false }, { status: 400 });

  const data = await GeneralAnnouncement.findById(id).lean();
  return Response.json({ success: true, data });
});

export const PUT = withAuth("super_admin", async (req, { params, user }) => {
  const { id } = await params;
  const ann = await GeneralAnnouncement.findById(id);
  if (!ann) return Response.json({ success: false }, { status: 404 });

  const { fields } = await parseMultipart(req);

  ann.title = one(fields.title) ?? ann.title;
  ann.body = one(fields.body) ?? ann.body;
  ann.startDate = one(fields.startDate) ?? ann.startDate;
  ann.endDate = one(fields.endDate) ?? ann.endDate;
  ann.status = one(fields.status) ?? ann.status;

  ann.cities = await validateIds(fields["cities[]"], City);
  ann.areas = await validateIds(fields["areas[]"], Area);
  ann.masjids = await validateIds(fields["masjids[]"], Masjid);
  ann.images = normalizeIds(fields.images);

  ann.updatedBy = user._id;
  ann.updatedAt = new Date();

  await ann.save();
  return Response.json({ success: true, data: ann });
});

export const DELETE = withAuth("super_admin", async (req, { params }) => {
  const { id } = await params;

  const ann = await GeneralAnnouncement.findById(id);
  if (!ann) {
    return Response.json(
      { success: false, message: "Announcement not found" },
      { status: 404 },
    );
  }

  // 🔥 Delete images from Cloudinary
  if (Array.isArray(ann.images)) {
    for (const url of ann.images) {
      try {
        const publicId = extractPublicId(url);
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to delete Cloudinary image:", url, err);
      }
    }
  }

  await ann.deleteOne();

  return Response.json({
    success: true,
    message: "Announcement and images deleted",
  });
});
