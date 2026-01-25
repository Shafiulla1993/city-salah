// src/app/api/masjid-admin/masjids/[id]/announcements/[announcementId]/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import mongoose from "mongoose";
import MasjidAnnouncement from "@/models/MasjidAnnouncement";

function assertOwnership(id, user) {
  const allowed = (user.masjidId || []).map(String);
  if (!allowed.includes(String(id))) {
    return { status: 403, json: { success: false, message: "Forbidden" } };
  }
  return null;
}

export const DELETE = withAuth("masjid_admin", async (_req, ctx) => {
  const { id, announcementId } = await ctx.params;

  if (
    !mongoose.isValidObjectId(id) ||
    !mongoose.isValidObjectId(announcementId)
  ) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const ownershipError = assertOwnership(id, ctx.user);
  if (ownershipError) return ownershipError;

  const deleted = await MasjidAnnouncement.findOneAndDelete({
    _id: announcementId,
    masjid: id,
  });

  if (!deleted) {
    return {
      status: 404,
      json: { success: false, message: "Announcement not found" },
    };
  }

  return {
    status: 200,
    json: { success: true },
  };
});

export const PUT = withAuth("masjid_admin", async (req, ctx) => {
  const { id, announcementId } = await ctx.params;
  const { title, body } = await req.json();

  if (
    !mongoose.isValidObjectId(id) ||
    !mongoose.isValidObjectId(announcementId)
  ) {
    return { status: 400, json: { success: false, message: "Invalid ID" } };
  }

  const ownershipError = assertOwnership(id, ctx.user);
  if (ownershipError) return ownershipError;

  if (!title || !body) {
    return {
      status: 400,
      json: { success: false, message: "title and body required" },
    };
  }

  const updated = await MasjidAnnouncement.findOneAndUpdate(
    { _id: announcementId, masjid: id },
    { title, body },
    { new: true },
  );

  if (!updated) {
    return {
      status: 404,
      json: { success: false, message: "Announcement not found" },
    };
  }

  return {
    status: 200,
    json: { success: true, data: updated },
  };
});
