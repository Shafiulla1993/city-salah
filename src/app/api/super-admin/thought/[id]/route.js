// src/app/api/super-admin/thought/[id]/route.js

import {
  getThoughtController,
  updateThoughtController,
  deleteThoughtController,
} from "@/server/controllers/superadmin/thought.controller";
import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getThoughtController({ id: params.id });
  return res;
});

export const PUT = withAuth(
  "super_admin",
  async ({ request, params, user }) => {
    const body = await request.json();
    const res = await updateThoughtController({ id: params.id, body, user });
    return res;
  }
);

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteThoughtController({ id: params.id });
  return res;
});
