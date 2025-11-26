// src/lib/middleware/withAuth.js
// src/lib/middleware/withAuth.js
import connectDB from "@/lib/db";
import { protect } from "@/server/middlewares/protect";
import { allowRoles } from "@/server/middlewares/role";

export function withAuth(roles, handler) {
  if (typeof roles === "string") roles = [roles];

  return async function (request, context) {
    await connectDB();

    // Authenticate user
    const auth = await protect(request);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    // Check role
    const permission = allowRoles(...roles)(auth.user);
    if (permission.error) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    // Execute route handler
    const result = await handler(request, { ...context, user: auth.user });

    // 🌟 ← The real fix: convert controller return to Response automatically
    if (result instanceof Response) return result;
    if (result?.status && result?.json) {
      return Response.json(result.json, { status: result.status });
    }

    // Handler returned nothing → enforce response
    return Response.json(
      { message: "Unexpected empty response from handler" },
      { status: 500 }
    );
  };
}
