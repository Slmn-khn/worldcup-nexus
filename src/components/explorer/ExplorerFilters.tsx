"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import type { ExplorerEventType } from "@/server/queries/types";

const EVENT_TYPE_LABELS: Record<ExplorerEventType, string> = {
  Match: "Matches",
  Goal: "Goals",
  Booking: "Bookings",
  Substitution: "Substitutions",
  PenaltyKick: "Penalty kicks",
  Award: "Awards",
};

export default function ExplorerFilters({
  eventTypes,
  tournamentYears,
  currentEventType,
  currentYear,
  currentPageSize,
}: {
  eventTypes: ExplorerEventType[];
  tournamentYears: number[];
  currentEventType: string | null;
  currentYear: number | null;
  currentPageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const hasFilters = currentEventType !== null || currentYear !== null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" }, flexWrap: "wrap", rowGap: 2 }}
    >
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="explorer-event-type">Event type</InputLabel>
        <Select
          labelId="explorer-event-type"
          label="Event type"
          value={currentEventType ?? ""}
          onChange={(event) =>
            updateParams({ eventType: event.target.value || null })
          }
        >
          <MenuItem value="">All event types</MenuItem>
          {eventTypes.map((eventType) => (
            <MenuItem key={eventType} value={eventType}>
              {EVENT_TYPE_LABELS[eventType]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel id="explorer-year">Tournament</InputLabel>
        <Select
          labelId="explorer-year"
          label="Tournament"
          value={currentYear !== null ? String(currentYear) : ""}
          onChange={(event) =>
            updateParams({ tournamentYear: event.target.value || null })
          }
        >
          <MenuItem value="">All tournaments</MenuItem>
          {tournamentYears.map((year) => (
            <MenuItem key={year} value={String(year)}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
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

      {hasFilters ? (
        <Button
          size="small"
          onClick={() =>
            updateParams({ eventType: null, tournamentYear: null })
          }
          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          Clear filters
        </Button>
      ) : null}
    </Stack>
  );
}
