"use client";

// Client feedback form. Collects the submission, renders the Turnstile widget,
// and POSTs JSON to /api/feedback. All real validation, rate limiting, spam
// scoring, and Turnstile verification happen server-side — this form only
// provides a clean UX and light required-field gating.

import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GlowCard from "@/components/ui/GlowCard";
import NeonButton from "@/components/ui/NeonButton";
import FeedbackTypeSelect from "@/components/feedback/FeedbackTypeSelect";
import TurnstileWidget from "@/components/feedback/TurnstileWidget";
import FeedbackSuccessState from "@/components/feedback/FeedbackSuccessState";
import {
  type FeedbackPrefill,
  type FeedbackTypeValue,
} from "@/server/feedback/validation";
import { atlasColors } from "@/theme/visualTokens";

type FeedbackFormProps = {
  prefill?: FeedbackPrefill;
};

type FormState = {
  type: FeedbackTypeValue | "";
  title: string;
  message: string;
  pageUrl: string;
  tournamentYear: string;
  countryName: string;
  playerName: string;
  matchLabel: string;
  name: string;
  email: string;
  companyWebsite: string; // honeypot
};

function initialState(prefill?: FeedbackPrefill): FormState {
  return {
    type: prefill?.type ?? "",
    title: "",
    message: "",
    pageUrl: prefill?.pageUrl ?? "",
    tournamentYear:
      prefill?.tournamentYear !== undefined
        ? String(prefill.tournamentYear)
        : "",
    countryName: prefill?.countryName ?? "",
    playerName: prefill?.playerName ?? "",
    matchLabel: prefill?.matchLabel ?? "",
    name: "",
    email: "",
    companyWebsite: "",
  };
}

const GENERIC_ERROR = "Something went wrong. Please try again later.";

export default function FeedbackForm({ prefill }: FeedbackFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(prefill));
  const [token, setToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Set on mount (not during render) to avoid SSR hydration mismatch and to
    // measure real time-to-submit for spam scoring.
    startedAtRef.current = Date.now();
  }, []);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Mirrors the server bypass (isTurnstileBypassEnabled): verification is only
  // skippable outside production. Without a site key we block in production
  // (the widget can't render) but allow dev, where the server bypass applies.
  const isDev = process.env.NODE_ENV !== "production";
  const turnstileBlocked = !siteKey && !isDev;
  const turnstileSatisfied = siteKey ? token !== null : isDev;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    !submitting &&
    !turnstileBlocked &&
    form.type !== "" &&
    form.title.trim().length >= 5 &&
    form.message.trim().length >= 20 &&
    turnstileSatisfied;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          turnstileToken: token ?? undefined,
          startedAt: startedAtRef.current ?? undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (response.ok && data?.ok) {
        setSucceeded(true);
        return;
      }

      setError(data?.message ?? GENERIC_ERROR);
      // Reset Turnstile so the user can retry with a fresh token.
      setToken(null);
      setResetSignal((n) => n + 1);
    } catch {
      setError(GENERIC_ERROR);
      setToken(null);
      setResetSignal((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialState(prefill));
    setToken(null);
    setResetSignal((n) => n + 1);
    setError(null);
    setSucceeded(false);
    startedAtRef.current = Date.now();
  };

  if (succeeded) {
    return <FeedbackSuccessState onReset={handleReset} />;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Feedback form"
    >
      <GlowCard sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={2.5}>
          <FeedbackTypeSelect
            value={form.type}
            onChange={(value) => update("type", value)}
            disabled={submitting}
          />

          <TextField
            fullWidth
            required
            label="Title"
            placeholder="A short summary"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            disabled={submitting}
            slotProps={{ htmlInput: { maxLength: 120 } }}
            helperText="5–120 characters"
          />

          <TextField
            fullWidth
            required
            multiline
            minRows={6}
            label="Message"
            placeholder="Describe the issue, idea, or correction in detail."
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            disabled={submitting}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            helperText={`${form.message.length}/2000 · at least 20 characters`}
          />

          <Box>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: atlasColors.textMuted,
                mb: 1.5,
              }}
            >
              Optional context
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <TextField
                fullWidth
                label="Page URL"
                placeholder="/matches/2022-final"
                value={form.pageUrl}
                onChange={(e) => update("pageUrl", e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
              <TextField
                fullWidth
                label="Tournament year"
                placeholder="2022"
                value={form.tournamentYear}
                onChange={(e) => update("tournamentYear", e.target.value)}
                disabled={submitting}
                slotProps={{
                  htmlInput: { inputMode: "numeric", maxLength: 4 },
                }}
              />
              <TextField
                fullWidth
                label="Country / team"
                value={form.countryName}
                onChange={(e) => update("countryName", e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
              <TextField
                fullWidth
                label="Player"
                value={form.playerName}
                onChange={(e) => update("playerName", e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />
              <TextField
                fullWidth
                label="Match"
                placeholder="Argentina vs France"
                value={form.matchLabel}
                onChange={(e) => update("matchLabel", e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 160 } }}
              />
              <TextField
                fullWidth
                label="Your name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                fullWidth
                type="email"
                label="Email"
                placeholder="Only if you'd like a reply"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 254 } }}
                helperText="Optional — do not share private personal information."
                sx={{ gridColumn: { sm: "1 / -1" } }}
              />
            </Box>
          </Box>

          {/* Honeypot — hidden from real users; bots fill it. Not announced to
            assistive tech and skipped in the tab order. */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: "-9999px",
              width: 1,
              height: 1,
              overflow: "hidden",
            }}
          >
            <label htmlFor="company-website">Company website</label>
            <input
              id="company-website"
              type="text"
              name="companyWebsite"
              tabIndex={-1}
              autoComplete="off"
              value={form.companyWebsite}
              onChange={(e) => update("companyWebsite", e.target.value)}
            />
          </Box>

          <TurnstileWidget onToken={setToken} resetSignal={resetSignal} />

          {error ? (
            <Alert
              severity="error"
              variant="outlined"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          ) : null}

          <Box>
            <NeonButton type="submit" neon="gold" disabled={!canSubmit}>
              {submitting ? "Sending…" : "Send feedback"}
            </NeonButton>
          </Box>
        </Stack>
      </GlowCard>
    </Box>
  );
}
