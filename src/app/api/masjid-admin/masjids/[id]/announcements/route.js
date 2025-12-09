// src/app/api/masjid-admin/masjids/[id]/announcements/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import {
  listMasjidAnnouncementsController,
  createMasjidAnnouncementController,
} from "@/server/controllers/masjidAdmin/announcements.controller";

export const GET = withAuth("masjid_admin", async (request, ctx) => {
  const { id } = await ctx.params;
  return await listMasjidAnnouncementsController({
    masjidId: id,
    user: ctx.user,
  });
});

export const POST = withAuth("masjid_admin", async (request, ctx) => {
  const awaitedParams = await ctx.params;
  const masjidId = awaitedParams.id;

  const { fields, files } = await parseMultipart(request);

  const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
  const bodyText = Array.isArray(fields.body) ? fields.body[0] : fields.body;

  if (!title || !bodyText) {
    return {
      status: 400,
      json: { success: false, message: "title and body required" },
    };
  }

  const fileArray = Array.isArray(files.file)
    ? files.file
    : files.file
    ? [files.file]
    : [];

  const uploaded = [];
  try {
    for (const f of fileArray) {
      const uploadRes = await uploadFileToCloudinary(
        f.filepath,
        "announcements"
      );
      uploaded.push(uploadRes.secure_url || uploadRes.url);
      await fs.unlink(f.filepath).catch(() => {});
    }

    return await createMasjidAnnouncementController({
      masjidId,
      title,
      body: bodyText,
      images: uploaded,
      user: ctx.user,
    });
  } catch (err) {
    console.error("createMasjidAnnouncementController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Upload failed" },
    };
  }
});
