// src/app/api/super-admin/cities/route.js
import {
  createCityController,
  getCitiesController,
} from "@/server/controllers/superadmin/cities.controller";

import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth("super_admin", async ({ request }) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getCitiesController({ query });
  return res;
});

export const POST = withAuth("super_admin", async ({ request }) => {
  const body = await request.json();
  const res = await createCityController({ body });
  return res;
});
