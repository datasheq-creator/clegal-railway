import "server-only";

/**
 * Fixed-window in-memory rate limiter. Adequate for a single Railway instance;
 * swap for Redis/Upstash if the service is ever scaled horizontally.
 */
type Bucket = { count: number; resetAt: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();
  let lastSweep = Date.now();

  function sweep(now: number) {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  return {
    check(key: string, now = Date.now()): { ok: boolean; retryAfterSec: number } {
      sweep(now);
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, retryAfterSec: 0 };
      }
      if (bucket.count >= limit) {
        return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
      }
      bucket.count += 1;
      return { ok: true, retryAfterSec: 0 };
    },
    reset() {
      buckets.clear();
    },
  };
}

/** Client IP behind Railway's proxy (first X-Forwarded-For hop). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
