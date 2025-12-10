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

  let body = { ...fields };

  // ---------------------------------------
  // 1️⃣ Restore ORIGINAL behavior
  //    Convert array → first element
  //    EXCEPT contacts & prayerTimings
  // ---------------------------------------
  Object.keys(body).forEach((key) => {
    if (
      Array.isArray(body[key]) &&
      key !== "contacts" &&
      key !== "prayerTimings"
    ) {
      body[key] = body[key][0];
    }
  });

  // ---------------------------------------
  // 2️⃣ JSON.parse SUPPORTS BOTH:
  //    - "[{...}]"
  //    - ["[{...}]"]
  // ---------------------------------------
  ["contacts", "prayerTimings", "location"].forEach((k) => {
    if (Array.isArray(body[k])) {
      body[k] = body[k][0];
    }
    if (typeof body[k] === "string") {
      try {
        body[k] = JSON.parse(body[k]);
      } catch {}
    }
  });

  // ---------------------------------------
  // 3️⃣ Image upload
  // ---------------------------------------
  if (files?.image) {
    const fileArr = files.image;
    const file = Array.isArray(fileArr) ? fileArr[0] : fileArr;
    const tmp = file.filepath;

    const uploaded = await uploadFileToCloudinary(tmp, "masjids");
    body.imageUrl = uploaded.secure_url || uploaded.url;
    body.imagePublicId = uploaded.public_id;

    await fs.unlink(tmp).catch(() => {});
  }

  return await createMasjidController({ body, user });
});
