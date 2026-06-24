// POST /api/feedback — secure, bot-resistant feedback intake.
//
// Every submission starts PRIVATE and moderated (status PENDING) and is never
// published automatically. The response is intentionally generic: it never
// leaks the spam score, rate-limit reason, Turnstile error codes, hashes, or
// internal errors / stack traces.

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { FeedbackStatus } from "@/generated/prisma/enums";
import { feedbackRequestSchema } from "@/server/feedback/validation";
import {
  isTurnstileBypassEnabled,
  verifyTurnstileToken,
} from "@/server/feedback/turnstile";
import { checkFeedbackRateLimit } from "@/server/feedback/rateLimit";
import {
  calculateSpamScore,
  createDuplicateHash,
  getClientIp,
  getUserAgentHash,
  hashSensitiveValue,
  SPAM_THRESHOLD,
} from "@/server/feedback/security";
import { notifyNewFeedback } from "@/server/feedback/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, generic messages — safe to show to anyone.
const MESSAGES = {
  success: "Thanks — your feedback was received.",
  invalid: "Please check the form and try again.",
  turnstile:
    "We could not verify the submission. Please refresh and try again.",
  rateLimited: "You’ve submitted feedback recently. Please try again later.",
  serverError: "Something went wrong. Please try again later.",
} as const;

const DUPLICATE_LOOKBACK_MS = 24 * 60 * 60 * 1000;

function ok() {
  return NextResponse.json({ ok: true, message: MESSAGES.success });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse JSON body.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: MESSAGES.invalid },
        { status: 400 },
      );
    }

    // 2. Validate with Zod.
    const parsed = feedbackRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: MESSAGES.invalid },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // 3. Honeypot — a real user never fills this hidden field. Return a generic
    //    success but do NOT save (do not tell bots they were detected).
    if (data.companyWebsite && data.companyWebsite.trim() !== "") {
      return ok();
    }

    // 4. Submission timing (used by spam scoring).
    const elapsedMs =
      typeof data.startedAt === "number" ? Date.now() - data.startedAt : null;

    // 5–6. Identity from proxy headers → salted hashes (never raw).
    const ip = getClientIp(request);
    const ipHash = hashSensitiveValue(ip) ?? "anonymous";
    const userAgentHash = getUserAgentHash(request);

    // 7. Verify Turnstile server-side (unless dev bypass is enabled).
    const bypass = isTurnstileBypassEnabled();
    let turnstileSuccess = bypass;
    if (!bypass) {
      if (!data.turnstileToken) {
        return NextResponse.json(
          { ok: false, message: MESSAGES.turnstile },
          { status: 400 },
        );
      }
      const verification = await verifyTurnstileToken({
        token: data.turnstileToken,
        ip,
      });
      turnstileSuccess = verification.success;
      if (!turnstileSuccess) {
        return NextResponse.json(
          { ok: false, message: MESSAGES.turnstile },
          { status: 400 },
        );
      }
    }

    // Content fingerprint for duplicate detection + duplicate rate limiting.
    const duplicateHash = createDuplicateHash(
      data.title,
      data.message,
      data.email,
    );

    // 8. Rate limit by IP (short + daily) and by duplicate content.
    const limit = await checkFeedbackRateLimit({ ipHash, duplicateHash });
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, message: MESSAGES.rateLimited },
        { status: 429 },
      );
    }

    // 9. Duplicate detection + spam scoring.
    const existingDuplicate = await prisma.feedbackSubmission.findFirst({
      where: {
        duplicateHash,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_LOOKBACK_MS) },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const spam = calculateSpamScore({
      honeypotFilled: false,
      elapsedMs,
      title: data.title,
      message: data.message,
      turnstileSuccess,
      duplicateExists: existingDuplicate !== null,
    });

    const status =
      spam.score >= SPAM_THRESHOLD
        ? FeedbackStatus.SPAM
        : FeedbackStatus.PENDING;

    // 10–11. Persist the submission and an audit event in one transaction.
    const submission = await prisma.feedbackSubmission.create({
      data: {
        type: data.type,
        status,
        title: data.title,
        message: data.message,
        pageUrl: data.pageUrl ?? null,
        tournamentYear: data.tournamentYear ?? null,
        countryName: data.countryName ?? null,
        playerName: data.playerName ?? null,
        matchLabel: data.matchLabel ?? null,
        email: data.email ?? null,
        name: data.name ?? null,
        ipHash,
        userAgentHash,
        turnstileSuccess,
        spamScore: spam.score,
        spamReasons: spam.reasons,
        duplicateHash,
        duplicateOfId: existingDuplicate?.id ?? null,
        events: {
          create: {
            action: "created",
            metadata: {
              spamScore: spam.score,
              spamReasons: spam.reasons,
              status,
            },
          },
        },
      },
      select: {
        id: true,
        type: true,
        title: true,
        pageUrl: true,
        createdAt: true,
      },
    });

    // 12. Optional notification (non-spam only) — never blocks the response.
    if (status !== FeedbackStatus.SPAM) {
      await notifyNewFeedback({
        id: submission.id,
        type: submission.type,
        title: submission.title,
        pageUrl: submission.pageUrl,
        createdAt: submission.createdAt,
      });
    }

    // 13. Generic success regardless of spam classification.
    return ok();
  } catch (error) {
    console.error("[feedback] failed to submit feedback", error);
    return NextResponse.json(
      { ok: false, message: MESSAGES.serverError },
      { status: 500 },
    );
  }
}
