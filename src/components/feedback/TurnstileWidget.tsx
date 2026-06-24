"use client";

// Cloudflare Turnstile client widget. Renders the challenge using the PUBLIC
// site key only — the secret never touches the browser; the captured token is
// verified server-side by /api/feedback. When no site key is configured it
// degrades gracefully (a dev notice locally, a friendly error in production).

import { useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { atlasColors, atlasBorders } from "@/theme/visualTokens";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global
{
  interface Window
  {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  /** Increment to force the widget to reset (e.g. after a failed submit). */
  resetSignal?: number;
};

export default function TurnstileWidget({
  onToken,
  resetSignal = 0,
}: TurnstileWidgetProps)
{
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleToken = useCallback(
    (token: string | null) => onToken(token),
    [onToken],
  );

  useEffect(() =>
  {
    if (!siteKey) return;
    let cancelled = false;

    const render = () =>
    {
      if (cancelled || !window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => handleToken(token),
        "expired-callback": () => handleToken(null),
        "error-callback": () => handleToken(null),
      });
    };

    if (window.turnstile)
    {
      render();
    } else
    {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );
      if (existing)
      {
        existing.addEventListener("load", render);
      } else
      {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", render);
        document.head.appendChild(script);
      }
    }

    return () =>
    {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile)
      {
        try
        {
          window.turnstile.remove(widgetIdRef.current);
        } catch
        {
          // ignore — widget may already be gone
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, handleToken]);

  // Reset when the parent bumps resetSignal.
  useEffect(() =>
  {
    if (resetSignal > 0 && widgetIdRef.current !== null && window.turnstile)
    {
      window.turnstile.reset(widgetIdRef.current);
      handleToken(null);
    }
  }, [resetSignal, handleToken]);

  if (!siteKey)
  {
    const isDev = process.env.NODE_ENV !== "production";
    return (
      <Box
        sx={{
          border: `1px dashed ${atlasBorders.softStrong}`,
          borderRadius: 2,
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: isDev ? atlasColors.textSecondary : atlasColors.red }}
        >
          {isDev
            ? "Turnstile not configured in development."
            : "Verification is temporarily unavailable. Please try again later."}
        </Typography>
      </Box>
    );
  }

  return <Box ref={containerRef} sx={{ minHeight: 65 }} />;
}
