// src/app/api/super-admin/masjids/[id]/route.js

import { parseForm } from "@/lib/middleware/parseForm";
import {
  getMasjidController,
  updateMasjidController,
  deleteMasjidController,
} from "@/server/controllers/superadmin/masjids.controller";

import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getMasjidController({ id: params.id });
  return res;
});

export const PUT = withAuth(
  "super_admin",
  async ({ request, params, user }) => {
    const { fields, files } = await parseForm(request).catch(() => ({
      fields: {},
      files: {},
    }));
    const file = files?.image || files?.file || null;
    const res = await updateMasjidController({
      id: params.id,
      fields,
      file,
      user,
    });
    return res;
  }
);

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteMasjidController({ id: params.id });
  return res;
});
