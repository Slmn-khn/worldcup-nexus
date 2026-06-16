// Schedule filter controls — composes the shared Vault archive filter bar with
// the schedule's status/group/stage selects and a team search. URL-driven (the
// underlying primitives push to the query string); options come from the DB.

import VaultFilterBar, {
  type ActiveFilterItem,
} from "@/components/filters/VaultFilterBar";
import type { FilterOptionDto } from "@/server/queries/types";

export type ScheduleFilterOptions = {
  statuses: FilterOptionDto[];
  groups: FilterOptionDto[];
  stages: FilterOptionDto[];
};

export default function ScheduleFilters({
  options,
  active,
  resultCount,
  totalCount,
}: {
  options: ScheduleFilterOptions;
  active: ActiveFilterItem[];
  resultCount: number;
  totalCount: number;
}) {
  return (
    <VaultFilterBar
      label="Schedule Controls"
      fields={[
        { kind: "search", placeholder: "Search team, venue, group…" },
        {
          kind: "select",
          param: "status",
          label: "Status",
          options: options.statuses,
          allLabel: "All statuses",
        },
        {
          kind: "select",
          param: "group",
          label: "Group",
          options: options.groups,
          allLabel: "All groups",
        },
        {
          kind: "select",
          param: "stage",
          label: "Stage",
          options: options.stages,
          allLabel: "All stages",
        },
      ]}
      active={active}
      resultCount={resultCount}
      totalCount={totalCount}
      resultNoun="matches"
    />
  );
}
