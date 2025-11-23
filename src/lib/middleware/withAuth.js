// src/lib/middleware/withAuth.js
import connectDB from "@/lib/db";
import { protect } from "@/server/middlewares/protect";
import { allowRoles } from "@/server/middlewares/role";

export function withAuth(roles, handler) {
  if (typeof roles === "string") roles = [roles];

  return async function (request, context) {
    await connectDB();

    // 1. Authenticate user
    const auth = await protect(request);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    // 2. Authorize role
    const check = allowRoles(...roles)(auth.user);
    if (check.error) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    // 3. Run actual route handler
    const result = await handler(
      {
        request,
        user: auth.user,
        nextUrl: request.nextUrl,
        params: context?.params,
      },
      context
    );

    // 4. If handler returned a real Response, return it directly
    if (result instanceof Response) {
      return result;
    }

    // 5. If handler returned { status, json }
    if (result && typeof result === "object" && "status" in result && "json" in result) {
      return Response.json(result.json, { status: result.status });
    }

    // 6. Anything else → wrap as JSON
    return Response.json(result);
  };
}
