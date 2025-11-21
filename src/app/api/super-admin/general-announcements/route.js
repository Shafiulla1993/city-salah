// src/app/api/super-admin/general-announcements/route.js

import {
  createGeneralAnnouncementController,
  getGeneralAnnouncementsController,
} from "@/server/controllers/superadmin/generalAnnouncements.controller";

import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async () => {
  const res = await getGeneralAnnouncementsController();
  return res;
});

export const POST = withAuth("super_admin", async ({ request, user }) => {
  const body = await request.json();
  const res = await createGeneralAnnouncementController({ body, user });
  return res;
});
