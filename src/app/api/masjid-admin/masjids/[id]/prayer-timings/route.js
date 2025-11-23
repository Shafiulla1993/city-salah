// // src/app/api/masjid-admin/masjids/[id]/prayer-timings/route.js
// import { withAuth } from "@/lib/middleware/withAuth";
// import { updateMasjidController } from "@/server/controllers/superadmin/masjids.controller";

// export const PUT = withAuth("masjid_admin", async ({ request, params, user }) => {
//   const allowed = Array.isArray(user.masjidId) ? user.masjidId.map(String) : [];
//   if (!allowed.includes(String(params.id))) {
//     return { status: 403, json: { success: false, message: "Forbidden: Not assigned to this masjid" } };
//   }

//   const body = await request.json().catch(() => ({}));
//   if (!body.prayerTimings) {
//     return { status: 400, json: { success: false, message: "prayerTimings required" } };
//   }

//   // update only prayerTimings
//   const res = await updateMasjidController({ id: params.id, body: { prayerTimings: body.prayerTimings }, user });
//   return res;
// });
