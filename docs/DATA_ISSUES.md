# WorldCup Atlas — Data Issues Log

Running log of known data conflicts, anomalies, and unresolved discrepancies between sources.

See `docs/DATA_SOURCES.md` for source definitions and conflict resolution policy.

---

## Issue template

```
### ISSUE-[NNN]: [Short title]

- **Date logged:** YYYY-MM-DD
- **Entity:** [tournament | match | player | goal | card | etc.]
- **Identifier:** [year, matchId, playerId, or other key]
- **Source A:** [source name + value]
- **Source B:** [source name + value]
- **Resolution:** [Fjelstul default | OpenFootball override | disputed | pending]
- **Notes:** [Any additional context]
```

---

<!-- Log issues below this line. Newest first. -->

### ISSUE-009: Player nationality is derived from squad membership

- **Date logged:** 2026-06-10
- **Entity:** player
- **Identifier:** all players
- **Source A:** Fjelstul `players.csv` — has no nationality/team column
- **Source B:** Fjelstul `squads.csv` — squad entries link players to national teams
- **Resolution:** Fjelstul default (derived)
- **Notes:** `Player.countryId` is set during import to the country of the player's most-frequent squad team, per the "primary team" design in `docs/DATA_MODEL.md`. Players who represented two nations (rare, e.g. 1930s Argentina→Italy transfers) get their first-listed nation; full per-tournament history remains in `SquadPlayer`. Before Checkpoint 5E this field was never populated — a 4B import gap fixed alongside the player pages.

### ISSUE-008: Penalty kick dataset covers shootouts only, without kick order

- **Date logged:** 2026-06-10
- **Entity:** penalty kick
- **Identifier:** all `penalty_kicks.csv` rows
- **Source A:** Fjelstul `penalty_kicks.csv` — no minute, order, saved, or missed columns; rows correspond to shootout matches
- **Source B:** —
- **Resolution:** Fjelstul default
- **Notes:** Imported with `type = SHOOTOUT` when the match is marked `penalty_shootout = 1` (all rows in practice; anything else would be flagged and imported as `IN_MATCH` with a warning). `order`, `minute`, `isSaved`, `isMissed` stay null. In-match penalties exist only as goals with the `penalty` flag (missed in-match penalties are not in the source).

### ISSUE-007: Substitution rows are one-sided

- **Date logged:** 2026-06-10
- **Entity:** substitution
- **Identifier:** all `substitutions.csv` rows
- **Source A:** Fjelstul `substitutions.csv` — each row is a single player movement (`going_off` or `coming_on`) with its own `substitution_id`; no pairing key links the player off to the player on
- **Source B:** —
- **Resolution:** Fjelstul default
- **Notes:** Each source row is imported as its own `Substitution` record with only `playerOutId` (going off) or `playerInId` (coming on) set. Pairing by match/team/minute would be guesswork for simultaneous substitutions, so it is not done. UI should aggregate by match + minute for display.

### ISSUE-006: No assist data in the goals dataset

- **Date logged:** 2026-06-10
- **Entity:** goal
- **Identifier:** all `goals.csv` rows
- **Source A:** Fjelstul `goals.csv` — no assist column
- **Source B:** —
- **Resolution:** Fjelstul default
- **Notes:** `Goal.assistPlayerId` stays null for the entire import. For own goals, `team_id` (team credited) differs from `player_team_id` (scorer's team); the credited team is imported and the scorer's team is preserved in `RawSourceRecord`.

### ISSUE-005: Referee–match links not available in selected subset

- **Date logged:** 2026-06-10
- **Entity:** match
- **Identifier:** all matches
- **Source A:** Fjelstul `matches.csv` — contains no referee column
- **Source B:** Fjelstul `referee_appointments.csv` — not in the Checkpoint 4A selected subset
- **Resolution:** pending
- **Notes:** Referees are imported as standalone entities; `Match.refereeId` stays null. Add `referee_appointments.csv` to the manifest in a later checkpoint to link them.

### ISSUE-004: Match kick-off times are local, stored without timezone conversion

- **Date logged:** 2026-06-10
- **Entity:** match
- **Identifier:** all matches
- **Source A:** Fjelstul `matches.csv` `match_date` + `match_time` (local stadium time, no timezone)
- **Source B:** —
- **Resolution:** Fjelstul default
- **Notes:** `Match.matchDate` stores date + time verbatim on a UTC timeline. Do not present these as UTC instants in the UI; treat the time component as local kick-off time.

### ISSUE-003: Shirt number 0 means "not recorded"

- **Date logged:** 2026-06-10
- **Entity:** squad player
- **Identifier:** early tournaments (e.g. 1930 squads)
- **Source A:** Fjelstul `squads.csv` — `shirt_number` of `0`
- **Source B:** —
- **Resolution:** Fjelstul default
- **Notes:** Imported as `null` rather than `0`, since shirt numbers start at 1. The raw value is preserved in `RawSourceRecord`.

### ISSUE-002: Team codes are ISO 3166-style, not FIFA codes

- **Date logged:** 2026-06-10
- **Entity:** country / team
- **Identifier:** e.g. Algeria
- **Source A:** Fjelstul `teams.csv` `team_code` = `DZA`
- **Source B:** FIFA code would be `ALG`
- **Resolution:** Fjelstul default
- **Notes:** Stored in `Country.code` / `Team.code`. `Country.fifaCode` is intentionally left null until a verified FIFA-code source is added.

### ISSUE-001: Source includes Men's and Women's World Cups

- **Date logged:** 2026-06-10
- **Entity:** tournament
- **Identifier:** WC-1930 … WC-2022 (men's, 22), WC-1991 … WC-2019 (women's, 8)
- **Source A:** Fjelstul `tournaments.csv` — 30 tournaments, names distinguish "FIFA Men's World Cup" / "FIFA Women's World Cup"
- **Source B:** —
- **Resolution:** Fjelstul default
- **Notes:** All 30 tournaments are imported; nothing is filtered out. Men's and women's editions never share a year, so `Tournament.year` stays unique and year-based slugs hold. Whether the product surfaces both is a UI/scope decision for a later checkpoint — the tournament `name` preserves the distinction.
