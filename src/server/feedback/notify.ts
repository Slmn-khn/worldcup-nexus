// Optional outbound notification when new feedback arrives. A no-op unless
// FEEDBACK_NOTIFY_WEBHOOK is set. The payload is deliberately minimal: it
// never includes raw IP/user agent, hashes, the full message body, or the
// submitter's email. Failures are logged and swallowed — notification must
// never block or fail a submission.

const NOTIFY_TIMEOUT_MS = 5000;

export type FeedbackNotification = {
  id: string;
  type: string;
  title: string;
  pageUrl?: string | null;
  createdAt: Date;
};

export async function notifyNewFeedback(
  input: FeedbackNotification,
): Promise<void> {
  const webhook = process.env.FEEDBACK_NOTIFY_WEBHOOK;
  if (!webhook || webhook.trim() === "") return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFY_TIMEOUT_MS);

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "WORLDCUP Nexus feedback",
        id: input.id,
        type: input.type,
        title: input.title.slice(0, 140),
        pageUrl: input.pageUrl ?? null,
        createdAt: input.createdAt.toISOString(),
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    console.warn("[feedback] notification webhook failed", error);
  } finally {
    clearTimeout(timeout);
  }
}
