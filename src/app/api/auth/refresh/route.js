import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { createAccessToken } from "@/server/utils/createTokens";

export async function GET(request) {
  await connectDB();

  const cookies = request.cookies;
  const refreshToken = cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user)
      return Response.json({ message: "Invalid token" }, { status: 401 });

    const accessToken = createAccessToken(user);

    const response = Response.json({ accessToken });

    response.headers.append(
      "Set-Cookie",
      `accessToken=${accessToken}; HttpOnly; Secure; Path=/; Max-Age=900; SameSite=Strict`
    );

    return response;
  } catch {
    return Response.json({ message: "Expired token" }, { status: 403 });
  }
}
