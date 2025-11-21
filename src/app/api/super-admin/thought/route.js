// src/app/api/super-admin/thought/route.js

import {
  createThoughtController,
  getThoughtsController,
} from "@/server/controllers/superadmin/thought.controller";
import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async () => {
  const res = await getThoughtsController();
  return res;
});

export const POST = withAuth("super_admin", async ({ request, user }) => {
  const body = await request.json();
  const res = await createThoughtController({ body, user });
  return res;
});
