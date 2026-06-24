"use client";

import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {
  FEEDBACK_TYPES,
  type FeedbackTypeValue,
} from "@/server/feedback/validation";

// Human-friendly labels for each feedback type. The values are the enum keys
// validated server-side; only the labels are presentational.
export const FEEDBACK_TYPE_LABELS: Record<FeedbackTypeValue, string> = {
  BUG_REPORT: "Bug report",
  INCORRECT_DATA: "Incorrect data",
  FEATURE_REQUEST: "Feature request",
  DESIGN_FEEDBACK: "Design/UI feedback",
  MISSING_DATA: "Missing player/team/tournament",
  SCHEDULE_ISSUE: "2026 schedule issue",
  OTHER: "Other",
};

type FeedbackTypeSelectProps = {
  value: FeedbackTypeValue | "";
  onChange: (value: FeedbackTypeValue) => void;
  required?: boolean;
  disabled?: boolean;
};

export default function FeedbackTypeSelect({
  value,
  onChange,
  required = true,
  disabled = false,
}: FeedbackTypeSelectProps) {
  return (
    <TextField
      select
      fullWidth
      required={required}
      disabled={disabled}
      label="Feedback type"
      value={value}
      onChange={(event) => onChange(event.target.value as FeedbackTypeValue)}
      slotProps={{ select: { displayEmpty: false } }}
    >
      {FEEDBACK_TYPES.map((type) => (
        <MenuItem key={type} value={type}>
          {FEEDBACK_TYPE_LABELS[type]}
        </MenuItem>
      ))}
    </TextField>
  );
}
