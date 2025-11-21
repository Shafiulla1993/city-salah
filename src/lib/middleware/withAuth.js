// src/lib/middleware/withAuth.js
import connectDB from "@/lib/db";
import { protect } from "@/server/middlewares/protect";
import { allowRoles } from "@/server/middlewares/role";

/**
 * New Signature:
 * withAuth(roles, handler)
 *
 * Example:
 * export const GET = withAuth("super_admin", async ({ request, params, user }) => {
 *   return getCitiesController();
 * });
 */
export function withAuth(roles, handler) {
  // Normalize role(s)
  if (typeof roles === "string") roles = [roles];

  return async function (request, context) {
    await connectDB();

    // -------- 1. AUTHENTICATION --------
    const auth = await protect(request);
    if (auth.error) {
      return new Response(JSON.stringify({ message: auth.error }), {
        status: auth.status,
      });
    }

    // -------- 2. ROLE CHECK --------
    const check = roles.length
      ? allowRoles(...roles)(auth.user)
      : { error: false };

    if (check.error) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }

    // -------- 3. RUN HANDLER --------
    // Provide a consistent signature: handler({ request, context }, user)
    const result = await handler(
      { request, context, user: auth.user },
      auth.user
    );

    // -------- 4. AUTO-WRAP CONTROLLER RESPONSE --------
    if (result?.status && result?.json !== undefined) {
      return new Response(JSON.stringify(result.json), {
        status: result.status,
      });
    }

    // -------- 5. Return raw Response if user returned Response --------
    return result;
  };
}
