// Abuse-prevention helpers for feedback submissions: client IP extraction,
// salted hashing of sensitive signals, duplicate-content hashing, and spam
// scoring. Raw IP addresses and raw user agents are NEVER stored — only
// salted SHA-256 hashes leave this module.

import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/** Salt for hashing. Empty when unconfigured — values are still hashed. */
function hashSalt(): string {
  return process.env.FEEDBACK_HASH_SALT ?? "";
}

/**
 * Best-effort client IP from proxy-set headers (never from the body/query, so
 * it cannot be spoofed by the submitter directly). Returns null in local dev
 * where no proxy headers exist.
 */
export function getClientIp(request: NextRequest): string | null {
  const headers = request.headers;

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor !== null && forwardedFor.trim() !== "") {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  const realIp = headers.get("x-real-ip");
  if (realIp !== null && realIp.trim() !== "")
    return realIp.trim().slice(0, 64);

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp !== null && cfIp.trim() !== "") return cfIp.trim().slice(0, 64);

  return null;
}

/**
 * Salted SHA-256 of a sensitive value (IP / user agent). Returns null for
 * nullish/blank input. The output is a 64-char hex digest — never the input.
 */
export function hashSensitiveValue(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return createHash("sha256").update(`${hashSalt()}:${trimmed}`).digest("hex");
}

/** Salted hash of the user-agent header, or null when absent. */
export function getUserAgentHash(request: NextRequest): string | null {
  return hashSensitiveValue(request.headers.get("user-agent"));
}

/**
 * Normalizes feedback text for duplicate detection: lowercase, trimmed,
 * whitespace collapsed, and runs of repeated punctuation reduced to one.
 */
export function normalizeFeedbackText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([^\p{L}\p{N}\s])\1+/gu, "$1");
}

/**
 * Deterministic salted hash of normalized title + message (+ email) used to
 * detect duplicate submissions. Email is included so the same person resending
 * identical text collides, while two people with different contact details do
 * not get falsely merged on borderline content.
 */
export function createDuplicateHash(
  title: string,
  message: string,
  email?: string | null,
): string {
  const normalized = [
    normalizeFeedbackText(title),
    normalizeFeedbackText(message),
    (email ?? "").trim().toLowerCase(),
  ].join("");
  return createHash("sha256")
    .update(`${hashSalt()}:${normalized}`)
    .digest("hex");
}

export type SpamScoreInput = {
  /** Honeypot field was filled (bots fill hidden fields). */
  honeypotFilled: boolean;
  /** Milliseconds between form render and submit, if known. */
  elapsedMs?: number | null;
  title: string;
  message: string;
  /** Server-side Turnstile verification result. */
  turnstileSuccess: boolean;
  /** A matching duplicate was seen recently. */
  duplicateExists?: boolean;
};

export type SpamScoreResult = {
  score: number;
  reasons: string[];
};

const URL_PATTERN = /\b(?:https?:\/\/|www\.)/gi;
const REPEATED_CHAR_PATTERN = /(.)\1{5,}/;

/**
 * Heuristic spam score. Higher = more suspicious. The score and reasons are
 * stored server-side for moderation only and are never returned to the client.
 */
export function calculateSpamScore(input: SpamScoreInput): SpamScoreResult {
  const reasons: string[] = [];
  let score = 0;

  if (input.honeypotFilled) {
    score += 100;
    reasons.push("honeypot_filled");
  }

  if (!input.turnstileSuccess) {
    score += 100;
    reasons.push("turnstile_failed");
  }

  if (
    typeof input.elapsedMs === "number" &&
    input.elapsedMs >= 0 &&
    input.elapsedMs < 3000
  ) {
    score += 25;
    reasons.push("submitted_too_fast");
  }

  const urlMatches = input.message.match(URL_PATTERN);
  if (urlMatches !== null && urlMatches.length > 3) {
    score += 35;
    reasons.push("too_many_urls");
  }

  if (
    REPEATED_CHAR_PATTERN.test(input.message) ||
    REPEATED_CHAR_PATTERN.test(input.title)
  ) {
    score += 20;
    reasons.push("repeated_characters");
  }

  if (isGenericMessage(input.message)) {
    score += 15;
    reasons.push("generic_message");
  }

  if (input.duplicateExists) {
    score += 40;
    reasons.push("duplicate_recent");
  }

  return { score, reasons };
}

/** Very low-information messages: too short or only a couple of distinct words. */
function isGenericMessage(message: string): boolean {
  const normalized = normalizeFeedbackText(message);
  const words = normalized.split(" ").filter((w) => w.length > 0);
  const distinct = new Set(words);
  return normalized.length < 25 || distinct.size <= 2;
}

/** Score at or above this is treated as spam. */
export const SPAM_THRESHOLD = 80;
