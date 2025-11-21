// src/app/api/super-admin/areas/route.js

import {
  createAreaController,
  getAreasController,
} from "@/server/controllers/superadmin/areas.controller";

import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth("super_admin", async () => {
  const res = await getAreasController();
  return res;
});

export const POST = withAuth("super_admin", async ({ request }) => {
  const body = await request.json();
  const res = await createAreaController({ body });
  return res;
});
