# WorldCup Atlas — Data Model

## Design principles

- Separate raw import tables (`raw_*`) from normalized production tables
- Raw tables preserve source data exactly as imported — no transformation
- Production tables are normalized, validated, and cross-referenced
- Derived stats tables are computed from production tables — never stored as source of truth
- All production tables include a `source` column pointing to the originating dataset

---

## Core entities and planned relationships

```
Tournament
  └── has many Groups
  └── has many Stages
  └── has many Matches
  └── has many TournamentSquads (via Team)
  └── has many Awards

Team (national team)
  └── has many TournamentSquads
  └── has many MatchLineups
  └── participates in many Matches (as home or away)

Player
  └── belongs to Team (primary national team)
  └── has many TournamentSquadEntries
  └── has many Goals
  └── has many Cards
  └── has many Substitutions
  └── has many PenaltyKicks
  └── may win many Awards

Match
  └── belongs to Tournament
  └── belongs to Stage
  └── belongs to Group (if group stage)
  └── has two MatchLineups (home, away)
  └── has many Goals
  └── has many Cards
  └── has many Substitutions
  └── has many PenaltyKicks (if penalty shootout)
  └── has one MatchResult

Goal
  └── belongs to Match
  └── belongs to Player
  └── belongs to Team
  └── type: regular | own_goal | penalty

Card
  └── belongs to Match
  └── belongs to Player
  └── type: yellow | yellow_red | red

Substitution
  └── belongs to Match
  └── player_off → Player
  └── player_on → Player

PenaltyKick
  └── belongs to Match
  └── belongs to Player
  └── outcome: scored | missed | saved

Award
  └── belongs to Tournament
  └── belongs to Player (winner)
  └── type: golden_ball | golden_boot | golden_glove | young_player
```

---

## Raw import tables

Created by the import pipeline before normalization. Prefixed `raw_`.

| Table                      | Source file                |
| -------------------------- | -------------------------- |
| `raw_tournaments`          | `tournaments.csv`          |
| `raw_teams`                | `teams.csv`                |
| `raw_players`              | `players.csv`              |
| `raw_matches`              | `matches.csv`              |
| `raw_goals`                | `goals.csv`                |
| `raw_bookings`             | `bookings.csv`             |
| `raw_substitutions`        | `substitutions.csv`        |
| `raw_penalty_kicks`        | `penalty_kicks.csv`        |
| `raw_squads`               | `squads.csv`               |
| `raw_manager_appointments` | `manager_appointments.csv` |
| `raw_award_winners`        | `award_winners.csv`        |

Raw tables are read-only after import. Re-importing drops and recreates them.

---

## Derived stats tables

Computed from normalized production tables. Must never be treated as authoritative source data. Rebuilt on demand or on a schedule after import.

| Table                     | Contains                                              |
| ------------------------- | ----------------------------------------------------- |
| `player_tournament_stats` | Goals, cards, appearances per player per tournament   |
| `team_tournament_stats`   | Wins, losses, draws, goals for/against per tournament |
| `team_all_time_stats`     | Aggregate across all tournaments                      |
| `player_all_time_stats`   | Aggregate across all tournaments                      |
| `top_scorers`             | Materialized view for golden boot leaderboard         |

---

## Key design decisions

### Slugs

- All public-facing entities (teams, players, tournaments) carry a `slug` column for clean URLs
- Slugs are generated at import time and must be stable across re-imports
- Format: lowercase, hyphen-separated, e.g. `diego-maradona`, `brazil`, `1986`

### Nationality vs squad membership

- A `Player` record carries a `primary_team_id` for default display
- Squad membership per tournament is tracked separately in `TournamentSquadEntry`
- Players who appeared for multiple national teams (rare edge cases) are handled by squad membership, not by changing the player's primary team

### Match result structure

- Full-time score, extra-time score, and penalty shootout result are stored separately
- The "winner" of a match is a derived field, not stored directly
- Walkovers and forfeits are flagged with a `match_type` enum

---

## Import phasing (Checkpoints 4B / 4C)

Checkpoint 4B imports core normalized data: tournaments, countries, teams,
players, stadiums, referees, matches, and squads — plus a verbatim
`RawSourceRecord` copy of every imported source row.

Checkpoint 4C imports event-level data: goals, bookings (cards),
substitutions, penalty kicks (shootout kicks), and awards. Derived fields
resolved from events: `Tournament.goalsCount` (count of imported goals) and
`Tournament.runnerUpTeamId` (losing finalist of the single decided "final"
stage match; tournaments without one, e.g. 1950's final round group, stay
null).

Import order (dependencies first): raw records → tournaments → countries →
teams → stadiums → referees → players → matches → squad players → goals →
bookings → substitutions → penalty kicks → awards.

Event-source caveats (see `docs/DATA_ISSUES.md`): goals carry no assist data;
substitution rows are one-sided (off and on are separate source rows);
penalty kicks are shootout kicks without order/minute data.

---

## Query layer (Checkpoint 4D)

Pages never query Prisma directly. `src/server/queries/` exposes typed
functions returning JSON-serializable DTOs (`src/server/queries/types.ts`):

- `home.ts` — `getArchiveStats`, `getHomePageData`
- `tournaments.ts` — `getTournamentCards`, `getTournamentByYear`, `getTournamentMatches`
- `matches.ts` — `getMatchByIdOrSlug`, `getFinalMatchForTournament`
- `countries.ts` — `getCountryCards`, `getCountryProfile`
- `players.ts` — `getPlayerCards`, `getPlayerProfile`
- `records.ts` — `getRecordsOverview`

Conventions:

- Raw Prisma models and `RawSourceRecord` payloads are never exposed to pages.
- Dates are ISO strings in DTOs.
- Deciding finals are matched by stage `"final"` (case-insensitive, exact) —
  verified against imported stage values; `"final round"` (1950) does not
  qualify, so 1950 has no final/runner-up.
- Squad data is labeled "squad tournaments"/selections, never "appearances" —
  match appearance data is not imported.
- Leaderboards are computed only from imported events and labeled with their
  exact scope (all imported tournaments, men's and women's editions).

Verified by `pnpm data:verify:queries` (`scripts/verify/verify-page-queries.ts`).

---

## Data verification strategy

### At import time

- Row counts per entity compared against expected totals from source documentation
- Foreign key integrity checks (every goal references a valid match and player)
- Date range checks (match dates fall within tournament dates)
- Score consistency (sum of goals per team matches reported score)

### Ongoing

- Verification scripts in `scripts/verify/`
- `pnpm verify` command runs all checks and outputs a report
- Any failed check blocks the import from being marked complete
- Results logged; critical failures documented in `docs/DATA_ISSUES.md`

### In the UI

- If a stat cannot be verified from source data, it is either omitted or shown with a "source pending" indicator
- No production page renders a hardcoded historical number
