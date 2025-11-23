// // src/app/api/masjid-admin/masjids/[id]/contacts/route.js
// import { withAuth } from "@/lib/middleware/withAuth";
// import { updateMasjidController } from "@/server/controllers/superadmin/masjids.controller";

// export const PUT = withAuth("masjid_admin", async ({ request, params, user }) => {
//   const allowed = Array.isArray(user.masjidId) ? user.masjidId.map(String) : [];
//   if (!allowed.includes(String(params.id))) {
//     return { status: 403, json: { success: false, message: "Forbidden: Not assigned to this masjid" } };
//   }

//   const body = await request.json().catch(() => ({}));
//   // Expect body.contacts = [{role,name,phone,email,note}, ...]
//   if (!Array.isArray(body.contacts)) {
//     return { status: 400, json: { success: false, message: "contacts array required" } };
//   }

//   // Only update contacts
//   const res = await updateMasjidController({ id: params.id, body: { contacts: body.contacts }, user });
//   return res;
// });
