// src/app/api/super-admin/masjids/delete-image/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import cloudinary from "@/lib/cloudinary";

export const POST = withAuth("super_admin", async (req) => {
  const { publicId } = await req.json();

  if (!publicId)
    return {
      status: 400,
      json: { success: false, message: "publicId required" },
    };

  await cloudinary.uploader.destroy(publicId).catch(() => {});

  return {
    status: 200,
    json: { success: true },
  };
});
