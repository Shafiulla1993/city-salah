// src/app/api/super-admin/general-prayer-timings/templates/[id]/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import {
  updateTemplateController,
  deleteTemplateController,
  getTemplateController,
} from "@/server/controllers/superadmin/generalPrayerTimings.controller";

// GET single template
export const GET = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;

  const res = await getTemplateController({ id });
  return res;
});

// UPDATE template
export const PUT = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;
  const body = await req.json();

  const res = await updateTemplateController({ id, body });
  return res;
});

// DELETE template
export const DELETE = withAuth("super_admin", async (req, ctx) => {
  const params = await ctx.params;
  const id = params.id;

  const res = await deleteTemplateController({ id });
  return res;
});
