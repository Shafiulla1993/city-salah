// src/app/api/super-admin/users/route.js

import {
  getAllUsersController,
  createUserController,
} from "@/server/controllers/superadmin/users.controller";
import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async () => {
  const res = await getAllUsersController();
  return res;
});

export const POST = withAuth("super_admin", async ({ request }) => {
  const body = await request.json();
  const res = await createUserController({ body });
  return res;
});
