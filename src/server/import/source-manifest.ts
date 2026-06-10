// Source manifest for the Fjelstul World Cup Database.
// Source: jfjelstul/worldcup (GitHub), CC-BY-SA 4.0 — see docs/DATA_SOURCES.md.
// Checkpoint 4A covers acquisition and inspection only; no normalization yet.

export const FJELSTUL_SOURCE_NAME = "Fjelstul World Cup Database";
export const FJELSTUL_REPO_URL = "https://github.com/jfjelstul/worldcup";
export const FJELSTUL_LICENSE = "CC-BY-SA 4.0";

/**
 * Base URL for raw CSV files in the `data-csv` folder of the source
 * repository. Update here if the repository moves or the branch changes.
 */
export const FJELSTUL_RAW_BASE_URL =
  "https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv";

/** Local cache folders, relative to the repository root. */
export const FJELSTUL_RAW_DIR = "data/sources/fjelstul/raw";
export const FJELSTUL_REPORTS_DIR = "data/sources/fjelstul/reports";

export type FjelstulDataset = {
  /** Human-readable source name shared by every dataset in this manifest. */
  source: typeof FJELSTUL_SOURCE_NAME;
  /** Stable identifier used by import scripts and reports. */
  key: string;
  /** Filename inside the source repository's `data-csv` folder. */
  filename: string;
  /** Raw GitHub URL the file is downloaded from. */
  url: string;
  /** Local cache path, relative to the repository root. */
  localPath: string;
  /**
   * Placeholder description. To be confirmed against the actual headers
   * during inspection — do not treat as verified documentation yet.
   */
  description: string;
  /** Required datasets must download successfully for the pipeline to proceed. */
  required: boolean;
};

function dataset(
  key: string,
  description: string,
  required = true,
): FjelstulDataset {
  const filename = `${key}.csv`;
  return {
    source: FJELSTUL_SOURCE_NAME,
    key,
    filename,
    url: `${FJELSTUL_RAW_BASE_URL}/${filename}`,
    localPath: `${FJELSTUL_RAW_DIR}/${filename}`,
    description,
    required,
  };
}

/**
 * Datasets selected for the first import pipeline. The source repository
 * provides more files; only this subset is needed for Checkpoint 4.
 */
export const FJELSTUL_DATASETS: FjelstulDataset[] = [
  dataset("tournaments", "Tournament metadata per World Cup edition."),
  dataset("teams", "National team records."),
  dataset("players", "Player records."),
  dataset("stadiums", "Stadium records."),
  dataset("referees", "Referee records."),
  dataset("qualified_teams", "Teams qualified per tournament."),
  dataset("matches", "Match results and metadata."),
  dataset("squads", "Tournament squad lists."),
  dataset("goals", "Individual goal events."),
  dataset("penalty_kicks", "Individual penalty kick outcomes."),
  dataset("bookings", "Yellow and red card events."),
  dataset("substitutions", "Substitution events."),
  dataset("award_winners", "Tournament award winners."),
];
