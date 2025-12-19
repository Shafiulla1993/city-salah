// src/app/api/uploads/masjid-image/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const POST = withAuth(["super_admin", "masjid_admin"], async (req) => {
  const { files } = await parseMultipart(req).catch(() => ({
    files: {},
  }));

  const file = Array.isArray(files?.image) ? files.image[0] : files?.image;
  if (!file) {
    return {
      status: 400,
      json: { success: false, message: "Image file required" },
    };
  }

  const tmp = file.filepath;

  try {
    const uploaded = await uploadFileToCloudinary(tmp, "masjids");

    return {
      status: 200,
      json: {
        success: true,
        imageUrl: uploaded.secure_url || uploaded.url,
        imagePublicId: uploaded.public_id,
      },
    };
  } finally {
    await fs.unlink(tmp).catch(() => {});
  }
});
