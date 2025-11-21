// src/app/api/super-admin/cities/[id]/route.js

import {
  getCityController,
  updateCityController,
  deleteCityController,
} from "@/server/controllers/superadmin/cities.controller";

import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getCityController({ id: params.id });
  return res;
});

export const PUT = withAuth("super_admin", async ({ request, params }) => {
  const body = await request.json();
  const res = await updateCityController({ id: params.id, body });
  return res;
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteCityController({ id: params.id });
  return res;
});
