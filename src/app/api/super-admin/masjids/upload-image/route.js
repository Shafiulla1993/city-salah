// src/app/api/super-admin/masjids/upload-image/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const POST = withAuth("super_admin", async (req) => {
  const { files } = await parseMultipart(req);
  const file = Array.isArray(files?.image) ? files.image[0] : files?.image;

  if (!file)
    return { status: 400, json: { success: false, message: "Image required" } };

  try {
    const uploaded = await uploadFileToCloudinary(file.filepath, "masjids");

    return {
      status: 200,
      json: {
        success: true,
        data: {
          imageUrl: uploaded.secure_url,
          imagePublicId: uploaded.public_id,
        },
      },
    };
  } finally {
    await fs.unlink(file.filepath).catch(() => {});
  }
});
