---
name: worldcup-data-integrity
description: Use when importing, transforming, verifying, or displaying historical World Cup data. Ensures no invented stats and requires source-backed verification.
---

# WorldCup Data Integrity Skill

When working with World Cup data:

1. Never invent data.
2. Never hardcode historical totals in UI components.
3. Prefer database queries or precomputed stats.
4. Keep raw imported data and normalized application data separate when possible.
5. Add verification scripts for:
   - tournament count
   - match count
   - final scores
   - winners
   - top scorers
   - country titles
   - penalty shootouts
6. Document conflicts in `docs/DATA_ISSUES.md`.
7. If a source is uncertain, mark it clearly instead of guessing.