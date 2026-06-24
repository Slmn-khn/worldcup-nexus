// Server-side Cloudflare Turnstile verification. Client-side Turnstile alone
// is not sufficient — the token MUST be verified here against Cloudflare using
// the server-only secret. The raw Cloudflare response is never returned to the
// client; only a boolean (plus internal error codes for server logging).

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const VERIFY_TIMEOUT_MS = 9000;

export type TurnstileVerifyInput = {
  token: string;
  ip?: string | null;
};

export type TurnstileVerifyResult = {
  success: boolean;
  /** Internal-only error codes for logging; never exposed to the client. */
  errorCodes?: string[];
};

/**
 * Returns true when the local dev bypass is explicitly enabled. Never honored
 * in production, regardless of the flag value.
 */
export function isTurnstileBypassEnabled(): boolean {
  return (
    process.env.FEEDBACK_TURNSTILE_BYPASS === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

/** Verifies a Turnstile token. Fails closed (success:false) on any error. */
export async function verifyTurnstileToken(
  input: TurnstileVerifyInput,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.trim() === "") {
    console.warn("[feedback] TURNSTILE_SECRET_KEY is not configured");
    return { success: false, errorCodes: ["missing-secret"] };
  }
  if (!input.token || input.token.trim() === "") {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", input.token);
  if (input.ip) body.set("remoteip", input.ip);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return { success: false, errorCodes: [`http-${response.status}`] };
    }

    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    return {
      success: data.success === true,
      errorCodes: data["error-codes"],
    };
  } catch (error) {
    console.warn("[feedback] turnstile verification request failed", error);
    return { success: false, errorCodes: ["network-error"] };
  } finally {
    clearTimeout(timeout);
  }
}
