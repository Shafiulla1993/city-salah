// src/app/api/super-admin/cities/route.js

import {
  createCityController,
  getCitiesController,
} from "@/server/controllers/superadmin/cities.controller";

import { withAuth } from "@/lib/middleware/withAuth";

export const GET = withAuth(
  "super_admin",
  async ({ request, params, user }) => {
    const res = await getCitiesController();
    return res; // {status, json} will be auto-wrapped by withAuth
  }
);

export const POST = withAuth(
  "super_admin",
  async ({ request, params, user }) => {
    const body = await request.json();
    const res = await createCityController({ body });
    return res;
  }
);
