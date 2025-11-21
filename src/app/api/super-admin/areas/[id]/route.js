// src/app/api/super-admin/areas/[id]/route.js

import {
  getAreaController,
  updateAreaController,
  deleteAreaController,
} from "@/server/controllers/superadmin/areas.controller";

import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getAreaController({ id: params.id });
  return res;
});

export const PUT = withAuth("super_admin", async ({ request, params }) => {
  const body = await request.json();
  const res = await updateAreaController({ id: params.id, body });
  return res;
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteAreaController({ id: params.id });
  return res;
});
