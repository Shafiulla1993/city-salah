// src/app/api/super-admin/masjids/route.js
import {
  createMasjidController,
  getAllMasjidsController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const GET = withAuth("super_admin", async (request) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getAllMasjidsController({ query });
  return res;
});

export const POST = withAuth("super_admin", async (request, user) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const body = { ...fields };

  // parse JSON-encoded fields if needed (contacts, prayerTimings, location)
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch {
        // ignore parse errors, leave as string
      }
    }
  });

  if (files?.file || files?.image) {
    const file = files.file || files.image;

    try {
      const uploadRes = await uploadFileToCloudinary(
        file.filepath || file.path,
        "masjids"
      );

      body.imageUrl = uploadRes.secure_url || uploadRes.url;
      body.imagePublicId = uploadRes.public_id;
    } catch (err) {
      console.error("Masjid image upload failed:", err);
      // (assuming withAuth wrapper understands this shape)
      return {
        status: 500,
        json: { success: false, message: "Image upload failed" },
      };
    } finally {
      try {
        const p = file.filepath || file.path;
        if (p) await fs.unlink(p).catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  const res = await createMasjidController({ body, user });
  return res;
});
