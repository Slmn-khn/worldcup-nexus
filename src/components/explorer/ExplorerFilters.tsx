"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
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

type Props = {
  filters: ExplorerDataDto["filters"];
  active: ExplorerDataDto["activeFilters"];
  currentPageSize: number;
};

export default function ExplorerFilters({
  filters,
  active,
  currentPageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [qInput, setQInput] = React.useState(active.q ?? "");

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Filter changes restart from the first page.
    params.delete("page");
    const query = params.toString();
    router.push(query === "" ? pathname : `${pathname}?${query}`);
  }

  function applyTextQuery() {
    updateParams({ q: qInput.trim() === "" ? null : qInput.trim() });
  }

  const hasFilters =
    active.eventType !== null ||
    active.tournamentYear !== null ||
    active.countrySlug !== null ||
    active.playerSlug !== null ||
    active.stage !== null ||
    active.q !== null;

  return (
    <Box
      sx={{
        // Command-panel framing for the filter console.
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        background: "linear-gradient(160deg, #122238 0%, #0D1828 100%)",
        boxShadow: "0 8px 24px rgba(2, 6, 14, 0.45)",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Typography
        variant="overline"
        component="p"
        sx={{
          color: "#38BDF8",
          fontWeight: 700,
          letterSpacing: "0.14em",
          mb: 1.5,
        }}
      >
        Query Console
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 2 }}
      >
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel id="explorer-event-type">Event type</InputLabel>
          <Select
            labelId="explorer-event-type"
            label="Event type"
            value={active.eventType ?? ""}
            onChange={(event) =>
              updateParams({ eventType: event.target.value || null })
            }
          >
            <MenuItem value="">All event types</MenuItem>
            {filters.eventTypes.map((eventType) => (
              <MenuItem key={eventType} value={eventType}>
                {EVENT_TYPE_LABELS[eventType]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="explorer-year">Tournament</InputLabel>
          <Select
            labelId="explorer-year"
            label="Tournament"
            value={
              active.tournamentYear !== null
                ? String(active.tournamentYear)
                : ""
            }
            onChange={(event) =>
              updateParams({ tournamentYear: event.target.value || null })
            }
          >
            <MenuItem value="">All tournaments</MenuItem>
            {filters.tournamentYears.map((year) => (
              <MenuItem key={year} value={String(year)}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="explorer-country">Country</InputLabel>
          <Select
            labelId="explorer-country"
            label="Country"
            value={active.countrySlug ?? ""}
            onChange={(event) =>
              updateParams({ countrySlug: event.target.value || null })
            }
          >
            <MenuItem value="">All countries</MenuItem>
            {filters.countries.map((country) => (
              <MenuItem key={country.slug} value={country.slug}>
                {country.flagEmoji ? `${country.flagEmoji} ` : ""}
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="explorer-player">Player</InputLabel>
          <Select
            labelId="explorer-player"
            label="Player"
            value={active.playerSlug ?? ""}
            onChange={(event) =>
              updateParams({ playerSlug: event.target.value || null })
            }
          >
            <MenuItem value="">All players</MenuItem>
            {filters.players.map((player) => (
              <MenuItem key={player.slug} value={player.slug}>
                {player.name}
                {player.countryName !== null ? ` (${player.countryName})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel id="explorer-stage">Stage</InputLabel>
          <Select
            labelId="explorer-stage"
            label="Stage"
            value={active.stage ?? ""}
            onChange={(event) =>
              updateParams({ stage: event.target.value || null })
            }
          >
            <MenuItem value="">All stages</MenuItem>
            {filters.stages.map((stage) => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="explorer-page-size">Rows</InputLabel>
          <Select
            labelId="explorer-page-size"
            label="Rows"
            value={String(currentPageSize)}
            onChange={(event) => updateParams({ pageSize: event.target.value })}
          >
            {[25, 50, 100].map((size) => (
              <MenuItem key={size} value={String(size)}>
                {size} rows
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1.5, mt: 2 }}
      >
        <TextField
          size="small"
          label="Text search"
          placeholder="e.g. maradona, azteca, semi-finals"
          value={qInput}
          onChange={(event) => setQInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyTextQuery();
          }}
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" size="small" onClick={applyTextQuery}>
          Apply
        </Button>
        {hasFilters ? (
          <Button
            size="small"
            onClick={() => {
              setQInput("");
              updateParams({
                eventType: null,
                tournamentYear: null,
                countrySlug: null,
                playerSlug: null,
                stage: null,
                q: null,
              });
            }}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </Stack>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block", mt: 1 }}
      >
        Player filter options are limited in v1 (players with recorded events,
        capped at 200).
      </Typography>
    </Box>
  );
}
