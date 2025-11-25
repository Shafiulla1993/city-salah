// src/lib/middleware/withAuth.js
import connectDB from "@/lib/db";
import { protect } from "@/server/middlewares/protect";
import { allowRoles } from "@/server/middlewares/role";

export function withAuth(roles, handler) {
  if (typeof roles === "string") roles = [roles];

  return async function (request, context) {
    await connectDB();

    // 1. Auth
    const auth = await protect(request);
    if (auth.error)
      return Response.json({ message: auth.error }, { status: auth.status });

    // 2. Role check
    const permission = allowRoles(...roles)(auth.user);
    if (permission.error)
      return Response.json({ message: "Forbidden" }, { status: 403 });

    // 3. Call handler with Next.js signature
    return handler(request, {
      ...context,
      user: auth.user,
    });
  };
}
