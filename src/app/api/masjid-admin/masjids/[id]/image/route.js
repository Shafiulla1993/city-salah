// // src/app/api/masjid-admin/masjids/[id]/image/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import {
  updateMasjidController,
  getMasjidController,
} from "@/server/controllers/superadmin/masjids.controller";
import fs from "fs/promises";

export const PUT = withAuth(
  "masjid_admin",
  async ({ request, params, user }) => {
    // Confirm user is assigned to this masjid
    const allowed = Array.isArray(user.masjidId)
      ? user.masjidId.map(String)
      : [];
    if (!allowed.includes(String(params.id))) {
      return {
        status: 403,
        json: {
          success: false,
          message: "Forbidden: Not assigned to this masjid",
        },
      };
    }

    const { fields, files } = await parseMultipart(request).catch(() => ({
      fields: {},
      files: {},
    }));
    if (!(files?.file || files?.image)) {
      return {
        status: 400,
        json: { success: false, message: "No image provided" },
      };
    }

    const file = files.file || files.image;
    try {
      const uploadRes = await uploadFileToCloudinary(
        file.filepath || file.path,
        "masjids"
      );
      const body = { imageUrl: uploadRes.secure_url || uploadRes.url };
      // Only allow updating imageUrl
      const res = await updateMasjidController({ id: params.id, body, user });
      return res;
    } catch (err) {
      console.error("masjid-admin image upload error:", err);
      return {
        status: 500,
        json: { success: false, message: "Image upload failed" },
      };
    } finally {
      try {
        const p = file.filepath || file.path;
        if (p) await fs.unlink(p).catch(() => {});
      } catch {}
    }
  }
);
