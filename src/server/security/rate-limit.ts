// Fixed-window, in-memory API rate limiter (Checkpoint 8B, P1.1).
//
// Limitation (documented in docs/SECURITY_HARDENING_PLAN.md): counters live
// in process memory, so limits are per server instance and reset on
// restart/redeploy. That is an acceptable launch baseline for this app;
// serious traffic should add platform/WAF or shared-store rate limiting on
// top. Identity comes from proxy-set headers only — never from query params.

import { NextResponse } from "next/server";

export type RateLimitBucket = "search" | "explorer" | "export" | "health";

export const RATE_LIMITS: Record<
  RateLimitBucket,
  { limit: number; windowMs: number }
> = {
  search: { limit: 60, windowMs: 60_000 },
  explorer: { limit: 60, windowMs: 60_000 },
  export: { limit: 6, windowMs: 60_000 },
  health: { limit: 120, windowMs: 60_000 },
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type WindowEntry = { windowStart: number; count: number };

// Survives module re-evaluation (dev HMR); still per-process by design.
const globalStore = globalThis as typeof globalThis & {
  __worldcupRateLimitStore?: Map<string, WindowEntry>;
};
const store: Map<string, WindowEntry> = (globalStore.__worldcupRateLimitStore ??=
  new Map());

// Cap the store so an attacker rotating spoofed IPs cannot grow memory
// unboundedly; clearing simply restarts everyone's window.
const MAX_STORE_ENTRIES = 10_000;

/** Client IP from proxy headers; "unknown" when none present (local dev). */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor !== null && forwardedFor.trim() !== "") {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = headers.get("x-real-ip");
  if (realIp !== null && realIp.trim() !== "") return realIp.trim().slice(0, 64);
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp !== null && cfIp.trim() !== "") return cfIp.trim().slice(0, 64);
  return "unknown";
}

/** Counts one hit for `ip` in `bucket` and reports whether it is allowed. */
export function checkRateLimit(
  bucket: RateLimitBucket,
  ip: string,
  now: number = Date.now(),
): RateLimitResult {
  const { limit, windowMs } = RATE_LIMITS[bucket];
  const key = `${bucket}:${ip}`;

  let entry = store.get(key);
  if (entry === undefined || now - entry.windowStart >= windowMs) {
    if (store.size >= MAX_STORE_ENTRIES) store.clear();
    entry = { windowStart: now, count: 0 };
    store.set(key, entry);
  }
  entry.count += 1;

  const resetAt = entry.windowStart + windowMs;
  const allowed = entry.count <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

/** Standard X-RateLimit-* headers for both allowed and limited responses. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

/**
 * Convenience wrapper for route handlers: returns a ready 429 response when
 * the request exceeds the bucket's limit, or null when it may proceed.
 */
export function enforceRateLimit(
  bucket: RateLimitBucket,
  request: Request,
): NextResponse | null {
  const result = checkRateLimit(bucket, getClientIp(request.headers));
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        ...rateLimitHeaders(result),
      },
    },
  );
}
