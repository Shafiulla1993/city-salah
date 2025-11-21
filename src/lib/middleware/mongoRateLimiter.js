import connectDB from "@/lib/db";
import RateLimit from "@/models/RateLimit";

export async function rateLimit(request, { keyPrefix, limit, windowSec }) {
  // Ensure DB is connected BEFORE accessing the model
  await connectDB();

  const userIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  const key = `${keyPrefix}_${userIP}`;

  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  let record = await RateLimit.findOne({ key });

  // First request → create new record
  if (!record) {
    await RateLimit.create({
      key,
      count: 1,
      lastRequest: now,
    });
    return { success: true };
  }

  // Reset window if expired
  if (record.lastRequest < windowStart) {
    record.count = 1;
    record.lastRequest = now;
    await record.save();
    return { success: true };
  }

  // If limit exceeded
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.lastRequest - windowStart) / 1000);
    return { success: false, retryAfter };
  }

  // Increase count
  record.count += 1;
  record.lastRequest = now;
  await record.save();

  return { success: true };
}
