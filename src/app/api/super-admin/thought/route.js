import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import {
  getThoughtsController,
  createThoughtController
} from "@/server/controllers/superadmin/thought.controller";
import fs from "fs/promises";

export const GET = withAuth("super_admin", async ({ request }) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  return await getThoughtsController({ query });
});

export const POST = withAuth("super_admin", async ({ request, user }) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({ fields: {}, files: {} }));
  const body = { ...fields };

  // upload images
  const images = [];

  const fileArray = Array.isArray(files.file)
    ? files.file
    : files.file
    ? [files.file]
    : [];

  for (const f of fileArray) {
    try {
      const uploaded = await uploadFileToCloudinary(f.filepath || f.path, "thoughts");
      images.push(uploaded.secure_url);
    } finally {
      try {
        await fs.unlink(f.filepath || f.path).catch(() => {});
      } catch {}
    }
  }

  if (images.length) {
    body.images = images;
  }

  return await createThoughtController({ body, user });
});
