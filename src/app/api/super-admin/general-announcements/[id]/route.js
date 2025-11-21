// src/app/api/super-admin/general-announcements/[id]/route.js

import {
  getGeneralAnnouncementController,
  updateGeneralAnnouncementController,
  deleteGeneralAnnouncementController,
} from "@/server/controllers/superadmin/generalAnnouncements.controller";

import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getGeneralAnnouncementController({ id: params.id });
  return res;
});

export const PUT = withAuth(
  "super_admin",
  async ({ request, params, user }) => {
    const body = await request.json();
    const res = await updateGeneralAnnouncementController({
      id: params.id,
      body,
      user,
    });
    return res;
  }
);

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteGeneralAnnouncementController({ id: params.id });
  return res;
});
