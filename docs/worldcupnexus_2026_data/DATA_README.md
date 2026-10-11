# WorldCup Nexus — 2026 Data Preparation Bundle

Prepared: 11 October 2026

This package is a production-safety handoff for adding the completed FIFA World Cup 2026 tournament to WorldCup Nexus. It intentionally separates official records, structurally validated import candidates, and quarantined data that must not be published without reconciliation.

## Trust tiers

### `01_verified_official/`

Records directly confirmed by FIFA sources:

- `tournament_summary_2026.csv`: dates, hosts, tournament totals, podium and final.
- `awards_2026.csv`: Fair Play, Golden/Silver/Bronze Boot, Golden Glove, Golden/Silver/Bronze Ball and Young Player.

The official FIFA awards PDF is included under `official_sources/`.

### `02_import_candidates/`

Normalized, structurally validated candidates derived from the Mominul 2026 relational dataset:

- 48 teams
- 16 venues
- 7 stages
- 28 referees
- 104 matches
- 1,248 players
- 601 event rows
- 5,408 lineup/squad rows
- 208 team-stat rows

Every row is marked `REQUIRES_RECONCILIATION`. These files are suitable for deterministic staging imports, but they are not blanket approval to publish every field.

Deliberately excluded from these candidates:

- Market values, because the source documentation says some values are heuristic estimates.
- ELO values and pre-tournament ranking fields lacking row-level provenance.
- xG from the core match file; xG should be enabled only after source and rights review.

### `03_quarantine/`

Data retained for investigation but blocked from normal production import:

- Cumulative player statistics, because official FIFA totals conflict with the candidate dataset.
- Redundant denormalized match rows.
- Excluded market values and derived ranking fields.

## Confirmed data conflicts and gaps

See `validation/known_conflicts.csv` for the machine-readable list.

1. FIFA records 769 tournament minutes for Kylian Mbappé; the candidate player and lineup data total 711.
2. FIFA records 698 minutes for Jude Bellingham; the candidate data total 596.
3. The candidate event file contains no substitution events, while WorldCup Nexus has a `Substitution` entity.
4. Lineup files include all 26 squad members for each team in each match. A zero-minute non-starter is an unused squad entry, not a participant.
5. Advanced statistics use mixed FIFA/Sofascore provenance. Keep per-row source attribution and review usage rights before publication.

These issues do not block importing the FIFA-verified tournament summary, official awards, teams, stages, venues, match scorelines or goal/own-goal records after repository-specific mapping and spot checks. They do block declaring cumulative player minutes and substitutions complete.

## Structural validation completed

The package passes 27 structural and referential checks, including:

- 48 teams, 1,248 players, 104 matches and 16 venues.
- Stage distribution: 72 group, 16 round-of-32, 8 round-of-16, 4 quarter-final, 2 semi-final, 1 third-place and 1 final.
- All candidate primary IDs are unique.
- All tested team, match, player, stage, venue and referee references resolve.
- Scorelines total 308 goals.
- Goal plus own-goal events reconcile to every match scoreline.
- Each match/team has 26 squad rows and exactly 11 marked starters.
- Each match has exactly two team-stat rows.

`validation/validation_report.json` contains the full result. Structural correctness is not the same as factual verification; the trust tiers must still be respected.

## Source snapshot

The unmodified downloaded files and source licence are under `source/`. `SOURCE_SNAPSHOT.md` pins the candidate repository at commit `2f61805ec8ac58e52882e8f0e2413a5cfa7f4d61`. `source_manifest.csv` records size and SHA-256 for every file in the package, making the handoff reproducible and tamper-evident.

Primary source locations:

- FIFA championship report: <https://inside.fifa.com/organisation/news/spain-crowned-world-cup-2026-champions-new-york-new-jersey>
- FIFA official awards PDF: <https://digitalhub.fifa.com/asset/5f21873f-792f-4972-9f55-96e73ac61a01/FIFA-World-Cup-2026-Official-FIFA-Awards.pdf>
- Candidate relational dataset: <https://github.com/mominullptr/FIFA-World-Cup-2026-Dataset>
- FIFA match-report hub: <https://www.fifatrainingcentre.com/en/fifa-world-cup-2026/match-report-hub.php>

The source repository labels its release CC0. This does not automatically settle rights for upstream third-party statistics, names, logos, photographs or media. WorldCup Nexus should keep factual data separate from protected media and preserve provenance.

## Re-run validation

From the extracted bundle root:

```bash
python3 scripts/prepare_bundle.py
```

The command regenerates the trust-tier files, validation output and manifest from the raw source snapshot. It exits non-zero if a structural invariant fails.

## Import policy

- Import to a disposable/local database first.
- Use idempotent upserts scoped to the 2026 tournament and a source namespace.
- Never delete or rewrite older World Cup records.
- Never run one long interactive Prisma transaction for the full tournament.
- Use bounded batches, checkpoints and a resumable import run.
- Treat FIFA-verified values as authoritative when sources disagree.
- Keep unknown values `NULL`; never manufacture substitutions, statistics or narratives.
- Require an explicit production flag and a pre-import backup before production writes.
- Rebuild PostgreSQL search only after database validation succeeds.

The accompanying `ADVANCED_AI_IMPLEMENTATION_PROMPT.md` contains the complete repository audit, implementation, visualization, testing and rollout brief.

