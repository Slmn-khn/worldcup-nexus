# Security Policy — WORLDCUP Nexus

WORLDCUP Nexus is a public, read-only historical archive. It has no user
accounts, stores no personal data, and exposes no write endpoints — but we
still take security reports seriously.

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

- If this repository is hosted on GitHub, open a **private security
  advisory** ("Security" tab → "Report a vulnerability").
- Otherwise, contact the project maintainer directly through the channel
  where you obtained this code.

Please include enough detail to reproduce the issue (affected route or
file, request/response, and impact). You should receive an acknowledgement
within a reasonable timeframe; please allow time for a fix before any
public disclosure.

## Scope

In scope:

- The application code in this repository (Next.js app, API routes,
  server layer, import/verify scripts).
- Information disclosure, injection, abuse/DoS amplification, and
  supply-chain issues affecting the built application.

Out of scope:

- Vulnerabilities in third-party hosting platforms or upstream data
  sources themselves (please report those upstream).
- Denial-of-service testing against any deployed instance — do not load
  test production systems you do not own.

## Existing hardening

See `docs/SECURITY_AUDIT.md` and `docs/SECURITY_HARDENING_PLAN.md` for the
current audit findings, implemented mitigations, and the deployment-time
checklist.
