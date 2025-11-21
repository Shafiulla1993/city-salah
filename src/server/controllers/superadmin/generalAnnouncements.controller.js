// src/server/controllers/superadmin/generalAnnouncements.controller.js
import GeneralAnnouncement from "@/models/GeneralAnnouncement";

export async function createGeneralAnnouncementController({ body, user }) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const announcement = await GeneralAnnouncement.create({
    ...body,
    expiresAt,
    createdBy: user._id,
  });
  return { status: 201, json: announcement };
}

export async function getGeneralAnnouncementsController() {
  const announcements = await GeneralAnnouncement.find().populate("city area");
  return { status: 200, json: announcements };
}

export async function getGeneralAnnouncementController({ id }) {
  const announcement = await GeneralAnnouncement.findById(id).populate(
    "city area"
  );
  return { status: 200, json: announcement };
}

export async function updateGeneralAnnouncementController({ id, body, user }) {
  const announcement = await GeneralAnnouncement.findById(id);
  if (!announcement)
    return { status: 404, json: { message: "Announcement not found" } };

  Object.keys(body).forEach((key) => (announcement[key] = body[key]));
  announcement.updatedBy = user._id;
  announcement.updatedAt = new Date();
  const updatedAnnouncement = await announcement.save();
  return {
    status: 200,
    json: {
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    },
  };
}

export async function deleteGeneralAnnouncementController({ id }) {
  await GeneralAnnouncement.findByIdAndDelete(id);
  return { status: 200, json: { message: "General announcement deleted" } };
}
