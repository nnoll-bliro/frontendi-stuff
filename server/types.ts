/**
 * The shapes the API hands back. The client imports these with `import type`, so
 * nothing from `server/` is ever pulled into the browser bundle — this file is the
 * single source of truth for both sides without being a runtime dependency.
 */

export type Plan = "free" | "pro" | "enterprise";
export type UserRole = "owner" | "admin" | "member";
export type Provider = "google" | "microsoft";
export type RsvpResponse = "accepted" | "declined" | "tentative" | "needs_action";
export type MeetingSource = "calendar" | "ad_hoc" | "phone";
export type MeetingStatus = "recording" | "processing" | "completed" | "failed";

export interface Org {
  id: string;
  name: string;
  domain: string;
  plan: Plan;
  createdAt: string;
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  jobTitle: string | null;
  role: UserRole;
  provider: Provider | null;
  createdAt: string;
}

export interface CalendarParticipant {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  company: string | null;
  response: RsvpResponse;
  isOrganizer: boolean;
}

export interface CalendarEntry {
  id: string;
  orgId: string;
  organizerId: string | null;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  durationMinutes: number;
  provider: Provider;
  isExternal: boolean;
  participants: CalendarParticipant[];
  /** The meeting Bliro recorded for this entry, if it has happened yet. */
  meetingId: string | null;
}

export interface TranscriptSegment {
  id: string;
  position: number;
  speaker: string;
  startMs: number;
  text: string;
}

/** List-row shape: enough for a table, without the transcript payload. */
export interface MeetingSummary {
  id: string;
  orgId: string;
  ownerId: string;
  ownerName: string;
  calendarEntryId: string | null;
  title: string;
  startedAt: string;
  durationMinutes: number;
  source: MeetingSource;
  status: MeetingStatus;
  language: string;
  hasSummary: boolean;
  participantCount: number;
}

export interface Meeting extends MeetingSummary {
  summary: string | null;
  transcript: TranscriptSegment[];
  /** Populated only when the meeting came from a calendar entry. */
  calendarEntry: CalendarEntry | null;
}

/** Whoever the playground is "signed in" as — the org owner. */
export interface Session {
  user: User;
  org: Org;
}
