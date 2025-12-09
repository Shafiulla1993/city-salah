// src/app/api/masjid-admin/announcements/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import {
  getMasjidAnnouncementByIdController,
  updateMasjidAnnouncementController,
  deleteMasjidAnnouncementController,
} from "@/server/controllers/masjidAdmin/announcements.controller";

// 🔥 GET (required for Edit modal)
export const GET = withAuth("masjid_admin", async (request, context) => {
  const awaitedParams = await context.params;
  const id = awaitedParams.id;

  return await getMasjidAnnouncementByIdController({
    id,
    user: context.user,
  });
});

// 🔄 UPDATE
export const PATCH = withAuth("masjid_admin", async (request, context) => {
  const awaitedParams = await context.params;
  const id = awaitedParams.id;

  const form = await request.formData();
  const title = form.get("title");
  const bodyText = form.get("body");
  const images = form.getAll("file") ?? [];

  return await updateMasjidAnnouncementController({
    id,
    title,
    body: bodyText,
    images,
    user: context.user,
  });
});

// ❌ DELETE
export const DELETE = withAuth("masjid_admin", async (request, context) => {
  const awaitedParams = await context.params;
  const id = awaitedParams.id;

  return await deleteMasjidAnnouncementController({
    id,
    user: context.user,
  });
});
