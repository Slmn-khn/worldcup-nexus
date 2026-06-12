"use client";

// Global search box (Checkpoint 6A) — debounced queries against /api/search,
// grouped results in a dropdown. Pages never depend on search availability:
// if Meilisearch is down only the dropdown shows an error.

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListSubheader from "@mui/material/ListSubheader";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "@/components/Link";

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);
import type { SearchResponseDto, SearchResultDto } from "@/server/search/types";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const SERVICE_ERROR_MESSAGE =
  "Search index is unavailable. Run pnpm search:index and make sure Meilisearch is running.";

const GROUPS: { key: keyof SearchResponseDto["groups"]; label: string }[] = [
  { key: "tournaments", label: "Tournaments" },
  { key: "countries", label: "Countries" },
  { key: "players", label: "Players" },
  { key: "matches", label: "Matches" },
  { key: "records", label: "Records" },
  { key: "events", label: "Events" },
];

function firstResult(response: SearchResponseDto): SearchResultDto | null {
  for (const group of GROUPS) {
    const item = response.groups[group.key][0];
    if (item !== undefined) return item;
  }
  return null;
}

export default function GlobalSearch() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [response, setResponse] = React.useState<SearchResponseDto | null>(
    null,
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResponse(null);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=18`,
          {
            signal: controller.signal,
          },
        );
        if (!result.ok) {
          setResponse(null);
          setError(SERVICE_ERROR_MESSAGE);
          return;
        }
        setResponse((await result.json()) as SearchResponseDto);
        setError(null);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setResponse(null);
          setError(SERVICE_ERROR_MESSAGE);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" && response !== null) {
      const first = firstResult(response);
      if (first !== null) {
        setOpen(false);
        router.push(first.href);
      }
    }
  }

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative" }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.75,
            bgcolor: "#122238",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2.5,
            transition: "border-color 150ms ease, box-shadow 200ms ease",
            "&:hover": { borderColor: "rgba(56, 189, 248, 0.5)" },
            "&:focus-within": {
              borderColor: "#38BDF8",
              boxShadow: "0 0 24px rgba(56, 189, 248, 0.16)",
            },
            "&:focus-within .GlobalSearch-icon": { color: "#38BDF8" },
          }}
        >
          <SearchIcon
            className="GlobalSearch-icon"
            sx={{ color: "text.secondary", transition: "color 150ms ease" }}
          />
          <InputBase
            fullWidth
            placeholder="Search tournaments, countries, players, matches…"
            inputProps={{ "aria-label": "Search the archive" }}
            sx={{ color: "text.primary", fontSize: "1.05rem" }}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {loading ? (
            <CircularProgress size={18} sx={{ color: "#38BDF8" }} />
          ) : null}
          {/* Loading shimmer: a cyan/gold light sweep along the bottom edge
              (transform-only). Reduced motion gets a static cyan strip. */}
          {loading ? (
            reducedMotion ? (
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: "rgba(56, 189, 248, 0.45)",
                }}
              />
            ) : (
              <MotionBox
                aria-hidden
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.7), rgba(244, 201, 93, 0.5), transparent)",
                }}
              />
            )
          ) : null}
        </Paper>

        <AnimatePresence>
          {showDropdown ? (
            <MotionPaper
              key="search-results"
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              elevation={8}
              role="region"
              aria-label="Search results"
              aria-live="polite"
              sx={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.modal,
                bgcolor: "#0D1828",
                border: "1px solid",
                borderColor: "rgba(56, 189, 248, 0.25)",
                borderRadius: 2,
                maxHeight: 480,
                overflowY: "auto",
                boxShadow:
                  "0 18px 50px rgba(2, 8, 20, 0.65), 0 0 24px rgba(56, 189, 248, 0.08)",
              }}
            >
              {error !== null ? (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", px: 2.5, py: 2 }}
                >
                  {error}
                </Typography>
              ) : response !== null && response.total === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", px: 2.5, py: 2 }}
                >
                  No results for “{response.query}”.
                </Typography>
              ) : response !== null ? (
                GROUPS.filter(
                  (group) => response.groups[group.key].length > 0,
                ).map((group, groupIndex) => (
                  <MotionBox
                    key={group.key}
                    initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: reducedMotion ? 0 : groupIndex * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <List
                      dense
                      disablePadding
                      subheader={
                        <ListSubheader
                          sx={{
                            bgcolor: "#122238",
                            color: "#38BDF8",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                            lineHeight: 2.6,
                          }}
                        >
                          {group.label}
                        </ListSubheader>
                      }
                    >
                      {response.groups[group.key].map((item) => (
                        <ListItemButton
                          key={item.id}
                          component={Link}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          sx={{
                            alignItems: "baseline",
                            flexWrap: "wrap",
                            columnGap: 1,
                            transition:
                              "background-color 150ms ease, box-shadow 150ms ease",
                            "&:hover, &:focus-visible": {
                              bgcolor: "rgba(56, 189, 248, 0.07)",
                              boxShadow: "inset 2px 0 0 #38BDF8",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 600 }}
                          >
                            {item.title}
                          </Typography>
                          {item.subtitle ? (
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {item.subtitle}
                            </Typography>
                          ) : null}
                        </ListItemButton>
                      ))}
                    </List>
                  </MotionBox>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", px: 2.5, py: 2 }}
                >
                  Searching…
                </Typography>
              )}
            </MotionPaper>
          ) : null}
        </AnimatePresence>

        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 1, px: 0.5 }}
        >
          Try: Brazil 1970, Maradona 1986, Argentina France final
        </Typography>
      </Box>
    </ClickAwayListener>
  );
}
