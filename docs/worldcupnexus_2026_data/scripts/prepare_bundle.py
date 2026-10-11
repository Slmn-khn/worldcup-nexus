#!/usr/bin/env python3
"""Prepare and validate the WorldCup Nexus 2026 import handoff.

This script intentionally separates FIFA-verified records from third-party
import candidates. It uses only the Python standard library so it can run in a
clean CI job without installing packages.
"""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
VERIFIED = ROOT / "01_verified_official"
CANDIDATES = ROOT / "02_import_candidates"
QUARANTINE = ROOT / "03_quarantine"
VALIDATION = ROOT / "validation"

FIFA_AWARDS_URL = (
    "https://digitalhub.fifa.com/asset/5f21873f-792f-4972-9f55-96e73ac61a01/"
    "FIFA-World-Cup-2026-Official-FIFA-Awards.pdf"
)
FIFA_FINAL_URL = (
    "https://inside.fifa.com/organisation/news/"
    "spain-crowned-world-cup-2026-champions-new-york-new-jersey"
)
DATASET_URL = "https://github.com/mominullptr/FIFA-World-Cup-2026-Dataset"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def project(rows: list[dict[str, str]], fields: list[str]) -> list[dict[str, str]]:
    return [{field: row.get(field, "") for field in fields} for row in rows]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require(condition: bool, message: str, checks: list[dict[str, object]]) -> None:
    checks.append({"check": message, "passed": condition})


def main() -> int:
    for directory in (VERIFIED, CANDIDATES, QUARANTINE, VALIDATION):
        directory.mkdir(parents=True, exist_ok=True)

    teams = read_csv(SOURCE / "teams.csv")
    venues = read_csv(SOURCE / "venues.csv")
    stages = read_csv(SOURCE / "tournament_stages.csv")
    referees = read_csv(SOURCE / "referees.csv")
    matches = read_csv(SOURCE / "matches.csv")
    detailed_matches = read_csv(SOURCE / "matches_detailed.csv")
    players = read_csv(SOURCE / "squads_and_players.csv")
    events = read_csv(SOURCE / "match_events.csv")
    lineups = read_csv(SOURCE / "match_lineups.csv")
    team_stats = read_csv(SOURCE / "match_team_stats.csv")
    player_stats = read_csv(SOURCE / "player_stats.csv")

    awards = [
        {
            "award_category": "FIFA Fair Play Trophy",
            "rank": "1",
            "recipient_type": "TEAM",
            "player_id": "",
            "player_name": "",
            "team_id": "21",
            "team_name": "Netherlands",
            "shirt_number": "",
            "goals": "",
            "assists": "",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Golden Boot",
            "rank": "1",
            "recipient_type": "PLAYER",
            "player_id": "842",
            "player_name": "Kylian Mbappé",
            "team_id": "33",
            "team_name": "France",
            "shirt_number": "10",
            "goals": "10",
            "assists": "4",
            "minutes": "769",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Silver Boot",
            "rank": "2",
            "recipient_type": "PLAYER",
            "player_id": "946",
            "player_name": "Lionel Messi",
            "team_id": "37",
            "team_name": "Argentina",
            "shirt_number": "10",
            "goals": "8",
            "assists": "4",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Bronze Boot",
            "rank": "3",
            "recipient_type": "PLAYER",
            "player_id": "1154",
            "player_name": "Jude Bellingham",
            "team_id": "45",
            "team_name": "England",
            "shirt_number": "10",
            "goals": "7",
            "assists": "1",
            "minutes": "698",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Golden Glove",
            "rank": "1",
            "recipient_type": "PLAYER",
            "player_id": "751",
            "player_name": "Unai Simón",
            "team_id": "29",
            "team_name": "Spain",
            "shirt_number": "23",
            "goals": "",
            "assists": "",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Golden Ball",
            "rank": "1",
            "recipient_type": "PLAYER",
            "player_id": "744",
            "player_name": "Rodri",
            "team_id": "29",
            "team_name": "Spain",
            "shirt_number": "16",
            "goals": "",
            "assists": "",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Silver Ball",
            "rank": "2",
            "recipient_type": "PLAYER",
            "player_id": "946",
            "player_name": "Lionel Messi",
            "team_id": "37",
            "team_name": "Argentina",
            "shirt_number": "10",
            "goals": "",
            "assists": "",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Bronze Ball",
            "rank": "3",
            "recipient_type": "PLAYER",
            "player_id": "842",
            "player_name": "Kylian Mbappé",
            "team_id": "33",
            "team_name": "France",
            "shirt_number": "10",
            "goals": "",
            "assists": "",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
        {
            "award_category": "Young Player Award",
            "rank": "1",
            "recipient_type": "PLAYER",
            "player_id": "750",
            "player_name": "Pau Cubarsí",
            "team_id": "29",
            "team_name": "Spain",
            "shirt_number": "22",
            "goals": "",
            "assists": "",
            "minutes": "",
            "source_url": FIFA_AWARDS_URL,
            "verification_status": "FIFA_OFFICIAL",
        },
    ]
    write_csv(VERIFIED / "awards_2026.csv", list(awards[0]), awards)

    tournament = [
        {
            "year": "2026",
            "name": "FIFA World Cup 2026",
            "start_date": "2026-06-11",
            "end_date": "2026-07-19",
            "host_countries": "Canada|Mexico|United States",
            "team_count": "48",
            "match_count": "104",
            "goal_count": "308",
            "venue_count": "16",
            "attendance": "6810966",
            "champion_team_id": "29",
            "champion": "Spain",
            "runner_up_team_id": "37",
            "runner_up": "Argentina",
            "third_place_team_id": "45",
            "third_place": "England",
            "fourth_place_team_id": "33",
            "fourth_place": "France",
            "final_match_id": "104",
            "source_url": FIFA_FINAL_URL,
            "verification_status": "FIFA_OFFICIAL",
        }
    ]
    write_csv(VERIFIED / "tournament_summary_2026.csv", list(tournament[0]), tournament)

    candidate_specs = {
        "teams_2026.csv": (
            teams,
            ["team_id", "team_name", "fifa_code", "group_letter", "confederation", "manager_name"],
        ),
        "venues_2026.csv": (
            venues,
            ["venue_id", "stadium_name", "city", "country", "capacity", "latitude", "longitude", "elevation_meters"],
        ),
        "tournament_stages_2026.csv": (
            stages,
            ["stage_id", "stage_name", "is_knockout"],
        ),
        "referees_2026.csv": (
            referees,
            ["referee_id", "name", "country"],
        ),
        "matches_2026.csv": (
            matches,
            [
                "match_id", "date", "kickoff_time_utc", "stage_id", "venue_id",
                "home_team_id", "away_team_id", "home_score", "away_score",
                "home_penalty_score", "away_penalty_score", "status", "result_type",
                "referee_id", "player_of_the_match_id",
            ],
        ),
        "players_2026.csv": (
            players,
            [
                "player_id", "team_id", "player_name", "position", "club_team",
                "caps", "date_of_birth", "height_cm", "goals",
            ],
        ),
        "match_events_2026.csv": (
            events,
            ["event_id", "match_id", "minute", "event_type", "team_id", "player_id"],
        ),
        "match_lineups_2026.csv": (
            lineups,
            [
                "lineup_id", "match_id", "player_id", "team_id", "is_starting_xi",
                "tactical_position", "minutes_played",
            ],
        ),
        "match_team_stats_2026.csv": (
            team_stats,
            [
                "match_id", "team_id", "possession_pct", "total_shots", "shots_on_target",
                "corners", "fouls", "offsides", "saves", "player_of_the_match",
                "data_source", "last_updated",
            ],
        ),
    }
    for filename, (rows, fields) in candidate_specs.items():
        output_rows = project(rows, fields)
        for row in output_rows:
            row["verification_status"] = "REQUIRES_RECONCILIATION"
            row["source_dataset"] = DATASET_URL
        write_csv(CANDIDATES / filename, fields + ["verification_status", "source_dataset"], output_rows)

    write_csv(
        QUARANTINE / "player_stats_2026_unverified.csv",
        list(player_stats[0]),
        player_stats,
    )
    write_csv(
        QUARANTINE / "matches_detailed_2026_redundant.csv",
        list(detailed_matches[0]),
        detailed_matches,
    )
    write_csv(
        QUARANTINE / "excluded_derived_team_fields.csv",
        ["team_id", "team_name", "fifa_ranking_pre_tournament", "elo_rating", "reason"],
        [
            {
                "team_id": row["team_id"],
                "team_name": row["team_name"],
                "fifa_ranking_pre_tournament": row["fifa_ranking_pre_tournament"],
                "elo_rating": row["elo_rating"],
                "reason": "Derived/ranking fields lack row-level provenance; do not publish without verification.",
            }
            for row in teams
        ],
    )
    write_csv(
        QUARANTINE / "excluded_market_values.csv",
        ["player_id", "player_name", "market_value_eur", "reason"],
        [
            {
                "player_id": row["player_id"],
                "player_name": row["player_name"],
                "market_value_eur": row["market_value_eur"],
                "reason": "Dataset documentation states some values are heuristic estimates.",
            }
            for row in players
        ],
    )

    conflicts = [
        {
            "severity": "BLOCKER_FOR_PLAYER_STATS",
            "area": "player_minutes",
            "record": "Kylian Mbappé",
            "candidate_value": "711",
            "official_value": "769",
            "action": "Use FIFA official award value for Golden Boot presentation; reconcile match-level minutes before publishing cumulative stats.",
        },
        {
            "severity": "BLOCKER_FOR_PLAYER_STATS",
            "area": "player_minutes",
            "record": "Jude Bellingham",
            "candidate_value": "596",
            "official_value": "698",
            "action": "Reconcile match-level minutes against official reports before publishing cumulative stats.",
        },
        {
            "severity": "BLOCKER_FOR_SUBSTITUTIONS",
            "area": "match_events",
            "record": "All matches",
            "candidate_value": "No Substitution events",
            "official_value": "Required by WorldCup Nexus schema",
            "action": "Acquire substitution events from FIFA reports or a licensed provider before populating Substitution.",
        },
        {
            "severity": "REVIEW_REQUIRED",
            "area": "lineups",
            "record": "All matches",
            "candidate_value": "26 rows per team per match",
            "official_value": "Matchday participation varies",
            "action": "Treat rows with zero minutes and not starting as unused squad entries; verify substitute appearances.",
        },
        {
            "severity": "REVIEW_REQUIRED",
            "area": "advanced_stats",
            "record": "xG and team/player statistics",
            "candidate_value": "Mixed FIFA/Sofascore provenance",
            "official_value": "No single official row-level source supplied",
            "action": "Retain provenance and publish only fields permitted by source terms and verified per match.",
        },
    ]
    write_csv(VALIDATION / "known_conflicts.csv", list(conflicts[0]), conflicts)

    checks: list[dict[str, object]] = []
    require(len(teams) == 48, "exactly 48 teams", checks)
    require(len(players) == 1248, "exactly 1,248 squad players", checks)
    require(len(matches) == 104, "exactly 104 matches", checks)
    require(len(venues) == 16, "exactly 16 venues", checks)
    require(len(stages) == 7, "exactly 7 tournament stages", checks)
    require(len(team_stats) == 208, "exactly two team-stat rows per match", checks)
    require(sum(int(row["home_score"]) + int(row["away_score"]) for row in matches) == 308, "scorelines total 308 goals", checks)

    stage_counts = Counter(row["stage_id"] for row in matches)
    require(
        stage_counts == Counter({"1": 72, "2": 16, "3": 8, "4": 4, "5": 2, "6": 1, "7": 1}),
        "stage distribution is 72/16/8/4/2/1/1",
        checks,
    )

    def unique(rows: list[dict[str, str]], key: str) -> bool:
        values = [row[key] for row in rows]
        return len(values) == len(set(values))

    for label, rows, key in (
        ("teams", teams, "team_id"),
        ("venues", venues, "venue_id"),
        ("stages", stages, "stage_id"),
        ("referees", referees, "referee_id"),
        ("matches", matches, "match_id"),
        ("players", players, "player_id"),
        ("events", events, "event_id"),
        ("lineups", lineups, "lineup_id"),
    ):
        require(unique(rows, key), f"{label}.{key} values are unique", checks)

    team_ids = {row["team_id"] for row in teams}
    venue_ids = {row["venue_id"] for row in venues}
    stage_ids = {row["stage_id"] for row in stages}
    referee_ids = {row["referee_id"] for row in referees}
    match_ids = {row["match_id"] for row in matches}
    player_ids = {row["player_id"] for row in players}

    require(all(row["home_team_id"] in team_ids and row["away_team_id"] in team_ids for row in matches), "all match teams resolve", checks)
    require(all(row["venue_id"] in venue_ids for row in matches), "all match venues resolve", checks)
    require(all(row["stage_id"] in stage_ids for row in matches), "all match stages resolve", checks)
    require(all(row["referee_id"] in referee_ids for row in matches), "all match referees resolve", checks)
    require(all(row["team_id"] in team_ids for row in players), "all player teams resolve", checks)
    require(all(row["match_id"] in match_ids and row["team_id"] in team_ids and row["player_id"] in player_ids for row in events), "all event foreign keys resolve", checks)
    require(all(row["match_id"] in match_ids and row["team_id"] in team_ids and row["player_id"] in player_ids for row in lineups), "all lineup foreign keys resolve", checks)

    goal_events = Counter(
        row["match_id"] for row in events if row["event_type"] in {"Goal", "Own Goal"}
    )
    require(
        all(
            goal_events[row["match_id"]]
            == int(row["home_score"]) + int(row["away_score"])
            for row in matches
        ),
        "goal and own-goal events reconcile to every match scoreline",
        checks,
    )

    lineup_index: dict[tuple[str, str], list[dict[str, str]]] = {}
    for row in lineups:
        lineup_index.setdefault((row["match_id"], row["team_id"]), []).append(row)
    require(all(len(rows) == 26 for rows in lineup_index.values()), "each match/team has 26 lineup/squad rows", checks)
    require(all(sum(row["is_starting_xi"] == "1" for row in rows) == 11 for rows in lineup_index.values()), "each match/team has 11 starters", checks)

    event_types = Counter(row["event_type"] for row in events)
    require(event_types.get("Substitution", 0) == 0, "substitution events are absent and must remain blocked", checks)

    validation = {
        "dataset": "WorldCup Nexus 2026 preparation bundle",
        "generated_from": DATASET_URL,
        "checks_passed": sum(bool(item["passed"]) for item in checks),
        "checks_total": len(checks),
        "all_structural_checks_passed": all(bool(item["passed"]) for item in checks),
        "known_blockers": 3,
        "event_type_counts": dict(sorted(event_types.items())),
        "checks": checks,
    }
    (VALIDATION / "validation_report.json").write_text(
        json.dumps(validation, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    manifest_rows = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.name == "source_manifest.csv":
            continue
        manifest_rows.append(
            {
                "path": path.relative_to(ROOT).as_posix(),
                "size_bytes": path.stat().st_size,
                "sha256": sha256(path),
            }
        )
    write_csv(ROOT / "source_manifest.csv", ["path", "size_bytes", "sha256"], manifest_rows)

    print(json.dumps(validation, indent=2, ensure_ascii=False))
    return 0 if validation["all_structural_checks_passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
