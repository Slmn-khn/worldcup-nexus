"use client";

// Explorer query console — built on the shared Vault filter components
// (Checkpoint 7D), so the explorer uses the same archive controls as the
// index pages. URL-driven; page resets to 1 on any filter change.

import VaultFilterBar from "@/components/filters/VaultFilterBar";
import { formatStage } from "@/lib/format";
import type {
  ExplorerDataDto,
  ExplorerEventType,
} from "@/server/queries/types";

const EVENT_TYPE_LABELS: Record<ExplorerEventType, string> = {
  Match: "Matches",
  Goal: "Goals",
  Booking: "Bookings",
  Substitution: "Substitutions",
  PenaltyKick: "Penalty kicks",
  Award: "Awards",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100].map((size) => ({
  label: `${size} rows`,
  value: String(size),
}));

type Props = {
  filters: ExplorerDataDto["filters"];
  active: ExplorerDataDto["activeFilters"];
  currentPageSize: number;
  total: number;
};

export default function ExplorerFilters({
  filters,
  active,
  currentPageSize,
  total,
}: Props) {
  const countryName =
    filters.countries.find((country) => country.slug === active.countrySlug)
      ?.name ?? active.countrySlug;
  const playerName =
    filters.players.find((player) => player.slug === active.playerSlug)
      ?.name ?? active.playerSlug;

  const activeItems = [
    active.eventType !== null
      ? {
          param: "eventType",
          label: "Event",
          value:
            EVENT_TYPE_LABELS[active.eventType as ExplorerEventType] ??
            active.eventType,
        }
      : null,
    active.tournamentYear !== null
      ? {
          param: "tournamentYear",
          label: "Tournament",
          value: String(active.tournamentYear),
        }
      : null,
    active.countrySlug !== null
      ? { param: "countrySlug", label: "Country", value: countryName ?? "" }
      : null,
    active.playerSlug !== null
      ? { param: "playerSlug", label: "Player", value: playerName ?? "" }
      : null,
    active.stage !== null
      ? {
          param: "stage",
          label: "Stage",
          value: formatStage(active.stage) ?? active.stage,
        }
      : null,
    active.q !== null
      ? { param: "q", label: "Search", value: active.q }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <VaultFilterBar
      label="Query Console"
      fields={[
        {
          kind: "search",
          placeholder: "Search events — e.g. maradona, azteca…",
        },
        {
          kind: "select",
          param: "eventType",
          label: "Event type",
          options: filters.eventTypes.map((eventType) => ({
            label: EVENT_TYPE_LABELS[eventType],
            value: eventType,
          })),
          allLabel: "All event types",
        },
        {
          kind: "select",
          param: "tournamentYear",
          label: "Tournament",
          options: filters.tournamentYears.map((year) => ({
            label: String(year),
            value: String(year),
          })),
          allLabel: "All tournaments",
        },
        {
          kind: "select",
          param: "countrySlug",
          label: "Country",
          options: filters.countries.map((country) => ({
            label: `${country.flagEmoji ? `${country.flagEmoji} ` : ""}${country.name}`,
            value: country.slug,
          })),
          allLabel: "All countries",
        },
        {
          kind: "select",
          param: "playerSlug",
          label: "Player",
          options: filters.players.map((player) => ({
            label:
              player.countryName !== null
                ? `${player.name} (${player.countryName})`
                : player.name,
            value: player.slug,
          })),
          allLabel: "All players",
        },
        {
          kind: "select",
          param: "stage",
          label: "Stage",
          options: filters.stages.map((stage) => ({
            label: formatStage(stage) ?? stage,
            value: stage,
          })),
          allLabel: "All stages",
        },
        {
          kind: "select",
          param: "pageSize",
          label: "Rows",
          options: PAGE_SIZE_OPTIONS,
          allLabel: `${currentPageSize} rows`,
        },
      ]}
      active={activeItems}
      resultCount={total}
      resultNoun="rows"
    />
  );
}
