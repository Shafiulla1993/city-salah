// src/app/api/super-admin/users/[id]/route.js

import {
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "@/server/controllers/superadmin/users.controller";

import { withAuth } from "@/server/utils/withAuth";

export const GET = withAuth("super_admin", async ({ params }) => {
  const res = await getUserByIdController({ id: params.id });
  return res;
});

export const PUT = withAuth("super_admin", async ({ request, params }) => {
  const body = await request.json();
  const res = await updateUserController({ id: params.id, body });
  return res;
});

export const DELETE = withAuth("super_admin", async ({ params }) => {
  const res = await deleteUserController({ id: params.id });
  return res;
});
