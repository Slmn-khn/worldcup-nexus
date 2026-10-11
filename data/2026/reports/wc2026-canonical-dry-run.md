# 2026 canonical import — dry-run

- Generated: 2026-10-11T06:11:04.397Z
- Outcome: OK
- Target: postgresql://***@localhost:5432/worldcup_atlas — LOCAL
- Bundle manifest sha256: `952c69ad900745798ede7167dc6cfbda105d6dc004cc2126f1a8d385cf74768a`
- Import run: none (no writes)

## Validation

| Status | Check | Detail |
| --- | --- | --- |
| PASS | every row maps to a reviewed canonical value |  |
| PASS | tournament year is 2026 |  |
| PASS | hosts are Canada, Mexico and United States |  |
| PASS | 48 teams (candidate = official) |  |
| PASS | 104 matches (candidate = official) |  |
| PASS | 16 venues (candidate = official) |  |
| PASS | 1,248 registered squad players |  |
| PASS | 26 players per team |  |
| PASS | stage distribution 72/16/8/4/2/1/1 |  |
| PASS | 12 groups A–L, 4 teams and 6 matches each |  |
| PASS | all natural keys are unique |  |
| PASS | every team, venue, stage, referee, match and player reference resolves |  |
| PASS | every match has two distinct teams, one stage and one venue |  |
| PASS | every event's team played in that match |  |
| PASS | scorelines total 308 (= official goal count) |  |
| PASS | goal + own-goal events reconcile with each team's score |  |
| PASS | every assist attaches to the goal it follows |  |
| PASS | shootout kicks are separate from goals (never counted in scores or Golden Boot) |  |
| PASS | shootout events reconcile with recorded penalty scores |  |
| KNOWN_CONFLICT | knockout draws have a valid extra-time or shootout outcome | 96 |
| PASS | group matches are never decided by penalties |  |
| PASS | FIFA podium: Spain, Argentina, England, France |  |
| PASS | final: Spain 1–0 Argentina after extra time on 19 July 2026 |  |
| PASS | candidate results agree with the FIFA podium |  |
| PASS | venue countries equal the official hosts |  |
| PASS | match dates span the official start/end dates |  |
| PASS | nine official awards resolve to the right player/team |  |
| PASS | candidate goal/assist events agree with official Boot figures |  |
| PASS | every player has a date of birth for identity resolution |  |
| WARN | player display names are unique (duplicates get deterministic slugs) | ali ahmed ×2; mc ×7 |
| PASS | source has no substitution events (Substitution stays blocked) |  |

## Known conflicts and decisions

- **M96_KNOCKOUT_DRAW_WITHOUT_OUTCOME** — Match 96 (Round of 16): Switzerland 0–0 Colombia: candidate result_type=Regular, no extra-time/penalty data, no shootout events; official Not supplied in the bundle. Decision: Import the 0–0 scoreline; leave extraTime, penalty scores and winningTeamId NULL and flag the match as outcome-incomplete. Switzerland's later quarter-final is NOT used to infer a shootout result.
- **PLAYER_MINUTES_MBAPPE** — Kylian Mbappé: candidate 711 (lineups); official 769 (FIFA awards). Decision: Lineup minutes are not imported; FIFA's 769 is shown with the Golden Boot award only.
- **PLAYER_MINUTES_BELLINGHAM** — Jude Bellingham: candidate 596 (lineups); official 698 (FIFA awards). Decision: Lineup minutes are not imported; FIFA's 698 is shown with the Bronze Boot award only.
- **NO_SUBSTITUTION_EVENTS** — All matches: candidate 0 substitution events; official Required by the Substitution model. Decision: Substitution stays empty for 2026; match pages show an explicit 'not recorded' state.
- **INCOMPLETE_BOOKINGS** — All matches: candidate 35 yellow / 12 red cards across 104 matches; official Not supplied in the bundle. Decision: Bookings withheld from canonical tables (raw records only) until reconciled with official match reports.
- **NO_IN_MATCH_PENALTY_FLAG** — All goals: candidate Goal events do not distinguish penalties; official Not supplied in the bundle. Decision: Goal.isPenalty is left false (schema default); documented as unrecorded for 2026 in docs/DATA_ISSUES.md.

## Withheld from canonical tables

| Data | Rows | Reason |
| --- | ---: | --- |
| bookings | 47 | Card events are visibly incomplete (well under one yellow card per match) — kept as raw records until reconciled with official match reports. |
| varReviews | 12 | No canonical VAR model; kept as raw records. |
| substitutions | 0 | Source has no substitution events; never inferred from minutes. |
| lineups | 5408 | Per-match minutes conflict with FIFA official totals (validation/known_conflicts.csv); no canonical appearance model. |
| teamStats | 208 | Mixed fifa.com / sofascore.com provenance; usage rights unreviewed. |
| playerOfTheMatch | 104 | Candidate-only field with no canonical column; raw only. |
| quarantine | 0 | 03_quarantine/* (player stats, market values, ELO/rankings, redundant match rows) is never read by this importer. |

## Planned operations

| Entity | Operations |
| --- | --- |
| countries | link: 43, create: 5 |
| teams | upsert: 48 |
| venues | link: 4, upsert: 12 |
| referees | link: 17, upsert: 11 |
| players | create: 899, link:dob+country+name: 349 |
| squadPlayers | upsert: 1248 |
| matches | upsert: 104 |
| goals | upsert: 308 |
| shootoutKicks | upsert: 30 |
| awards | upsert: 9 |

## Warnings

- DR Congo: Same football association as the 1974 'Zaire' entry (country slug 'zaire'); kept as a separate era name, matching the archive's West Germany/Germany convention.
- referee Alireza Faghani: country differs (Iran → Australia); canonical row kept unchanged
- player 290: source name "Mc" is truncated — stored as "Unidentified Scotland player (source #290)" until a reviewed override supplies the name
- player 293: source name "Mc" is truncated — stored as "Unidentified Scotland player (source #293)" until a reviewed override supplies the name
- player 309: source name "Mc" is truncated — stored as "Unidentified Scotland player (source #309)" until a reviewed override supplies the name
- player 312: source name "Mc" is truncated — stored as "Unidentified Scotland player (source #312)" until a reviewed override supplies the name
- player 334: source name "Mc" is truncated — stored as "Unidentified United States player (source #334)" until a reviewed override supplies the name
- player 722: source name "Mc" is truncated — stored as "Unidentified New Zealand player (source #722)" until a reviewed override supplies the name

## Identity resolution

349 candidate players linked to existing canonical profiles (no duplicates created); 6 truncated source names stored as "Unidentified …" pending review.

## Next steps

- `pnpm data:2026:canonical:write`
