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
