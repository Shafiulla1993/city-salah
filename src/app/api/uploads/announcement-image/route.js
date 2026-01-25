// src/app/api/uploads/announcement-image/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const POST = withAuth("super_admin", async (req) => {
  const { files } = await parseMultipart(req);
  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file)
    return Response.json(
      { success: false, message: "No file" },
      { status: 400 },
    );

  const up = await uploadFileToCloudinary(file.filepath, "announcements");
  await fs.unlink(file.filepath).catch(() => {});

  return Response.json({
    success: true,
    url: up.secure_url,
    public_id: up.public_id,
  });
});
