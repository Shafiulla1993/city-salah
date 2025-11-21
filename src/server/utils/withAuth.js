// src/server/utils/withAuth.js
import connectDB from "@/lib/db";
import { protect } from "@/server/middlewares/protect";
import { allowRoles } from "@/server/middlewares/role";

/**
 * withAuth - generic wrapper for route handlers.
 *
 * roleOrRoles: string | string[] | null
 * handler: async (request, context, user) => Response-like object or regular Response
 *
 * The handler may:
 * - return a Next Response object directly, OR
 * - return an object like { status, json } (controller style) - it will be converted to Response.
 */
export function withAuth(roleOrRoles = null, handler) {
  return async function wrappedHandler(request, context) {
    // connect DB once
    await connectDB();

    // run protect() middleware
    const auth = await protect(request);
    if (auth?.error) {
      return new Response(JSON.stringify({ message: auth.error }), {
        status: auth.status || 401,
      });
    }

    // role check if provided
    if (roleOrRoles) {
      const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
      // allowRoles utility in your code expects a single role and returns a function,
      // so we test against each role and allow if any passes.
      let allowed = false;
      for (const r of roles) {
        const check = allowRoles(r)(auth.user);
        if (!check?.error) {
          allowed = true;
          break;
        }
      }
      if (!allowed) {
        return new Response(JSON.stringify({ message: "Forbidden" }), {
          status: 403,
        });
      }
    }

    // call handler
    const result = await handler(request, context, auth.user);

    // If handler already returned a Response (Next Response), forward it
    if (result instanceof Response) return result;

    // If handler returned controller-style { status, json }
    if (
      result &&
      typeof result === "object" &&
      "status" in result &&
      "json" in result
    ) {
      return new Response(JSON.stringify(result.json), {
        status: result.status,
      });
    }

    // Otherwise, assume result is JSON-able body and return 200
    return new Response(JSON.stringify(result ?? {}), { status: 200 });
  };
}

// convenience wrappers
export const withSuperAdmin = (handler) => withAuth("super_admin", handler);
export const withAuthAny = (roles, handler) => withAuth(roles, handler);
