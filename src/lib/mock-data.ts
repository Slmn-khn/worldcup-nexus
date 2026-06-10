/**
 * Temporary UI mock data until the database import pipeline is implemented.
 * Do not treat these values as source of truth.
 *
 * Used only by the static home page (Checkpoint 3). Remove once pages are
 * wired to the database in Checkpoint 5.
 */

export const MOCK_ARCHIVE_STATS = [
  { label: "Tournaments", value: "20+", helper: "1930 to today" },
  { label: "Nations", value: "80+", helper: "Qualified at least once" },
  { label: "Matches", value: "900+", helper: "Every stage, every era" },
  { label: "Goals", value: "2,500+", helper: "Scorers, minutes, assists" },
];

export const MOCK_TOURNAMENTS = [
  {
    year: 1970,
    host: "Mexico",
    winner: "Brazil",
    runnerUp: "Italy",
    finalScore: "4–1",
    summary:
      "Widely remembered as one of the greatest tournaments ever played, crowned by a legendary Brazil side.",
  },
  {
    year: 1986,
    host: "Mexico",
    winner: "Argentina",
    runnerUp: "West Germany",
    finalScore: "3–2",
    summary:
      "A tournament defined by individual brilliance and one of the most dramatic finals in World Cup history.",
  },
  {
    year: 1998,
    host: "France",
    winner: "France",
    runnerUp: "Brazil",
    finalScore: "3–0",
    summary:
      "The first 32-team World Cup, ending with the host nation lifting the trophy in Paris.",
  },
];

export const MOCK_MATCHES = [
  {
    title: "Italy v West Germany",
    tournament: "Mexico 1970",
    score: "4–3",
    stage: "Semi-final",
    summary:
      "Five goals in extra time — a match so dramatic it earned its own monument.",
  },
  {
    title: "Argentina v England",
    tournament: "Mexico 1986",
    score: "2–1",
    stage: "Quarter-final",
    summary:
      "Two of the most debated and celebrated goals ever scored, four minutes apart.",
  },
  {
    title: "Argentina v France",
    tournament: "Qatar 2022",
    score: "3–3 (4–2 pens)",
    stage: "Final",
    summary:
      "A final for the ages, swinging back and forth before being settled from the spot.",
  },
];

export const MOCK_COUNTRIES = [
  {
    name: "Brazil",
    flagEmoji: "🇧🇷",
    summary:
      "The only nation to appear at every World Cup, with a record trophy haul.",
  },
  {
    name: "Germany",
    flagEmoji: "🇩🇪",
    summary:
      "Decades of consistency: finals, semi-finals, and famous comebacks.",
  },
  {
    name: "Argentina",
    flagEmoji: "🇦🇷",
    summary:
      "Home of two of the greatest players the tournament has ever seen.",
  },
  {
    name: "Italy",
    flagEmoji: "🇮🇹",
    summary:
      "Four-time champions built on defensive artistry and tournament pedigree.",
  },
];

export const MOCK_PLAYERS = [
  {
    name: "Pelé",
    country: "Brazil",
    summary:
      "The only player to win the World Cup three times, debuting as a teenager in 1958.",
  },
  {
    name: "Diego Maradona",
    country: "Argentina",
    summary:
      "Carried Argentina to glory in 1986 with one of the great individual tournaments.",
  },
  {
    name: "Zinedine Zidane",
    country: "France",
    summary:
      "Defined two finals, eight years apart, in completely different ways.",
  },
  {
    name: "Lionel Messi",
    country: "Argentina",
    summary: "A two-decade World Cup story that ended with the trophy in 2022.",
  },
];

export const MOCK_RECORDS = [
  {
    title: "Most titles",
    value: "5",
    description:
      "One nation stands alone at the top of the all-time champions list.",
  },
  {
    title: "Most tournament goals",
    value: "16",
    description: "The all-time scoring record, built across four World Cups.",
  },
  {
    title: "Biggest final stage win",
    value: "10–1",
    description: "Group-stage blowouts that still stand as scoring records.",
  },
];
