// src/app/api/uploads/thought-image/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";

export const POST = withAuth("super_admin", async (req) => {
  const { files } = await parseMultipart(req);

  const file = Array.isArray(files?.file) ? files.file[0] : files?.file;

  if (!file) {
    return Response.json(
      { success: false, message: "No file uploaded" },
      { status: 400 },
    );
  }

  const uploaded = await uploadFileToCloudinary(
    file.filepath || file.path,
    "thoughts",
  );

  await fs.unlink(file.filepath || file.path).catch(() => {});

  return Response.json({
    success: true,
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  });
});
