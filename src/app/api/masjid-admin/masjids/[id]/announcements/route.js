// src/app/api/masjid-admin/masjids/[id]/announcements/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import MasjidAnnouncement from "@/models/MasjidAnnouncement";

/* ---------------- Ownership Helper ---------------- */
function assertOwnership(id, user) {
  const allowed = (user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }
  return null;
}

/* ===============================
   GET – List Own Masjid Announcements
================================ */
export const GET = withAuth("masjid_admin", async (_req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

  const ownershipError = assertOwnership(id, ctx.user);
  if (ownershipError) return ownershipError;

  const announcements = await MasjidAnnouncement.find({ masjid: id })
    .sort("-createdAt")
    .lean();

  return {
    status: 200,
    json: { success: true, data: announcements },
  };
});

/* ===============================
   POST – Create Announcement
================================ */
export const POST = withAuth("masjid_admin", async (req, ctx) => {
  const { id } = await ctx.params;

  if (!mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      json: { success: false, message: "Invalid masjid ID" },
    };
  }

  const ownershipError = assertOwnership(id, ctx.user);
  if (ownershipError) return ownershipError;

  const { fields, files } = await parseMultipart(req);

  const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
  const body = Array.isArray(fields.body) ? fields.body[0] : fields.body;

  if (!title || !body) {
    return {
      status: 400,
      json: { success: false, message: "title and body required" },
    };
  }

  const fileArray = Array.isArray(files?.file)
    ? files.file
    : files?.file
      ? [files.file]
      : [];

  const images = [];

  try {
    for (const f of fileArray) {
      const uploaded = await uploadFileToCloudinary(
        f.filepath,
        "announcements",
      );
      images.push(uploaded.secure_url || uploaded.url);
      await fs.unlink(f.filepath).catch(() => {});
    }

    const announcement = await MasjidAnnouncement.create({
      masjid: id,
      title,
      body,
      images,
      createdBy: ctx.user._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h auto-expiry
    });

    return {
      status: 201,
      json: { success: true, data: announcement },
    };
  } catch (err) {
    console.error("Masjid Admin Announcement Create Error:", err);
    return {
      status: 500,
      json: { success: false, message: "Upload failed" },
    };
  }
});
