// Server-side rate limiting for feedback submissions, backed by Upstash Redis
// so limits are shared across serverless instances (unlike the in-memory
// limiter used for read-only public APIs).
//
// Limits:
//   - per IP:        3 submissions / 10 minutes
//   - per IP daily: 10 submissions / 24 hours
//   - per duplicate: 1 identical submission / 24 hours
//
// When Upstash is not configured: development allows (with a warning) so the
// feature is usable locally; production FAILS CLOSED for safety.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type FeedbackRateLimitInput = {
  ipHash: string;
  duplicateHash?: string;
};

export type FeedbackRateLimitResult = {
  allowed: boolean;
  reason?: string;
  reset?: number;
};

type Limiters = {
  perIp: Ratelimit;
  perIpDaily: Ratelimit;
  perDuplicate: Ratelimit;
};

let cached: Limiters | null = null;

function getLimiters(): Limiters | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (cached) return cached;

  const redis = new Redis({ url, token });
  cached = {
    perIp: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "10 m"),
      prefix: "feedback:ip",
      analytics: false,
    }),
    perIpDaily: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "24 h"),
      prefix: "feedback:ip:daily",
      analytics: false,
    }),
    perDuplicate: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "24 h"),
      prefix: "feedback:dup",
      analytics: false,
    }),
  };
  return cached;
}

function unconfiguredResult(): FeedbackRateLimitResult {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[feedback] rate limiter not configured — failing closed in production",
    );
    return { allowed: false, reason: "rate_limit_unavailable" };
  }
  console.warn(
    "[feedback] rate limiter not configured — allowing in development",
  );
  return { allowed: true };
}

/**
 * Applies the per-IP, daily, and per-duplicate limits in order. Returns
 * `allowed:false` with a (server-only) reason on the first breach.
 */
export async function checkFeedbackRateLimit(
  input: FeedbackRateLimitInput,
): Promise<FeedbackRateLimitResult> {
  const limiters = getLimiters();
  if (!limiters) return unconfiguredResult();

  try {
    const [short, daily] = await Promise.all([
      limiters.perIp.limit(input.ipHash),
      limiters.perIpDaily.limit(input.ipHash),
    ]);

    if (!short.success) {
      return { allowed: false, reason: "ip_rate_limited", reset: short.reset };
    }
    if (!daily.success) {
      return {
        allowed: false,
        reason: "daily_rate_limited",
        reset: daily.reset,
      };
    }

    if (input.duplicateHash) {
      const dup = await limiters.perDuplicate.limit(input.duplicateHash);
      if (!dup.success) {
        return {
          allowed: false,
          reason: "duplicate_rate_limited",
          reset: dup.reset,
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.warn("[feedback] rate limit check failed", error);
    // Backend failure: fail closed in production, open in development.
    if (process.env.NODE_ENV === "production") {
      return { allowed: false, reason: "rate_limit_unavailable" };
    }
    return { allowed: true };
  }
}
