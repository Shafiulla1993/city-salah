// src/app/api/super-admin/areas/route.js
import {
  createAreaController,
  getAreasController,
} from "@/server/controllers/superadmin/areas.controller";

import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth("super_admin", async (request) => {
  // convert URL search params to object and pass to controller
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getAreasController({ query });
  return res;
});

export const POST = withAuth("super_admin", async (request) => {
  const body = await request.json();
  const res = await createAreaController({ body });
  return res;
});
