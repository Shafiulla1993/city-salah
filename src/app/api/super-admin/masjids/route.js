// src/app/api/super-admin/masjids/route.js

import { parseForm } from "@/lib/middleware/parseForm";
import {
  createMasjidController,
  getAllMasjidsController,
} from "@/server/controllers/superadmin/masjids.controller";
import { withAuth } from "@/lib/middleware/withAuth";

// ---------------- GET ALL MASJIDS ----------------
export const GET = withAuth("super_admin", async ({ user }) => {
  // DEBUG: check user object
  console.log("[GET /masjids] Current user:", user);

  // Call controller
  const res = await getAllMasjidsController();
  return res; // { status, json } will be handled by withAuth
});

// ---------------- CREATE MASJID ----------------
export const POST = withAuth("super_admin", async ({ request, user }) => {
  // DEBUG: check user
  console.log("[POST /masjids] Current user:", user);

  // Parse form (multipart or JSON)
  const { fields, files } = await parseForm(request).catch(() => ({
    fields: {},
    files: {},
  }));

  const file = files?.image || files?.file || null;

  // Call controller with parsed fields, file, and user
  const res = await createMasjidController({ fields, file, user });
  return res;
});
