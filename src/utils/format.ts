import dayjs from "dayjs";

import type { MeetingStatus, RsvpResponse } from "@server/types";
import { colors } from "@bliro/ui/theme/colors";

/** "14:30" */
export const formatTime = (iso: string) => dayjs(iso).format("HH:mm");

/** "Mon, 16 Sep" */
export const formatDate = (iso: string) => dayjs(iso).format("ddd, D MMM");

/** "Mon, 16 Sep · 14:30" */
export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`;

/** Day heading: "Today" / "Tomorrow" / "Yesterday", else the date. */
export function formatDayLabel(iso: string): string {
  const day = dayjs(iso).startOf("day");
  const diff = day.diff(dayjs().startOf("day"), "day");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return day.format("dddd, D MMMM");
}

/** "45m" / "1h 5m" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** Transcript timestamps: "01:24" */
export function formatOffset(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** "NN" — the initials an Avatar wants. */
export function initials(name: string): string {
  const parts = name
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0] ?? ""];
  return letters.map((part) => part.charAt(0).toUpperCase()).join("");
}

interface Tone {
  label: string;
  color: string;
  background: string;
}

export const MEETING_STATUS_TONE: Record<MeetingStatus, Tone> = {
  scheduled: { label: "Scheduled", color: colors.blue.dark, background: colors.blue[600] },
  in_progress: { label: "In progress", color: colors.yellow.dark, background: colors.yellow[600] },
  held: { label: "Held", color: colors.green.dark, background: colors.green[600] },
  cancelled: { label: "Cancelled", color: colors.red.dark, background: colors.red[600] },
};

export const RSVP_TONE: Record<RsvpResponse, Tone> = {
  accepted: { label: "Accepted", color: colors.green.dark, background: colors.green[600] },
  declined: { label: "Declined", color: colors.red.dark, background: colors.red[600] },
  tentative: { label: "Maybe", color: colors.yellow.dark, background: colors.yellow[600] },
  needs_action: { label: "No response", color: colors.dark[400], background: colors.dark[800] },
};

export const MEETING_SOURCE_LABEL = {
  calendar: "From calendar",
  ad_hoc: "Ad hoc",
  phone: "Phone call",
} as const;
