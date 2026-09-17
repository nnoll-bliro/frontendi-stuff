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
export type MeetingStatus = "scheduled" | "in_progress" | "held" | "cancelled";
export type ArtifactStatus = "collecting" | "processing" | "ready" | "failed";

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
  /** Canonical touchpoint, if represented; independent of recording/transcription. */
  meetingId: string | null;
}

export interface TranscriptSegment {
  id: string;
  position: number;
  speaker: string;
  startMs: number;
  text: string;
}

export interface CompanyRef {
  id: string;
  name: string;
}

export interface PersonRef {
  id: string;
  name: string;
}

export interface MeetingRef {
  id: string;
  title: string;
}

export interface CompanySummary extends CompanyRef {
  domain: string;
  overview: string;
}

export interface PersonSummary extends PersonRef {
  email: string;
  jobTitle: string;
  overview: string;
  company: CompanyRef | null;
}

export interface KnowledgeItem {
  id: string;
  kind: "internal_note" | "revenue_context";
  title: string;
  content: string;
}

export interface Company extends CompanySummary {
  people: PersonSummary[];
  meetings: MeetingSummary[];
  agentSessions: AgentSessionSummary[];
  knowledge: KnowledgeItem[];
}

export interface Person extends PersonSummary {
  /** Membership-based history, never all meetings/sessions for their company. */
  meetings: MeetingSummary[];
  agentSessions: AgentSessionSummary[];
  knowledge: KnowledgeItem[];
}

export interface MeetingParticipant {
  id: string;
  personId: string | null;
  userId: string | null;
  name: string;
  email: string;
}

export interface Transcript {
  id: string;
  status: ArtifactStatus;
  language: string;
  segments: TranscriptSegment[];
}

export interface MeetingDocumentation {
  id: string;
  source: "meeting_summary" | "phone_assistant" | "voice_memo";
  status: ArtifactStatus;
  title: string;
  content: string | null;
  /** Provenance only: this session's conversation is NOT the customer transcript. */
  agentSessionId: string | null;
}

export interface AgentSessionSummary {
  id: string;
  title: string;
  channel: "call" | "chat";
  startedAt: string;
  overview: string;
  company: CompanyRef | null;
  people: PersonRef[];
  meeting: MeetingRef | null;
}

/**
 * Documentation this assistant conversation produced, shown from the session side.
 * The artifact belongs to the meeting it describes; the session is only its origin.
 */
export interface AgentSessionDocumentation {
  id: string;
  source: MeetingDocumentation["source"];
  status: ArtifactStatus;
  title: string;
  content: string | null;
  meeting: MeetingRef;
}

export interface AgentSession extends AgentSessionSummary {
  messages: { id: string; position: number; role: "user" | "assistant"; text: string }[];
  documentation: AgentSessionDocumentation[];
}

/** List-row shape: no transcript or documentation content payload. */
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
  kind: "meeting" | "call";
  overview: string;
  company: CompanyRef | null;
  people: PersonRef[];
  participants: MeetingParticipant[];
  participantCount: number;
  transcriptStatus: ArtifactStatus | null;
  hasDocumentation: boolean;
}

export interface Meeting extends MeetingSummary {
  documentation: MeetingDocumentation[];
  /** null means no transcript exists, not pending or failed processing. */
  transcript: Transcript | null;
  agentSessions: AgentSessionSummary[];
  /** Populated only when the meeting came from a calendar entry. */
  calendarEntry: CalendarEntry | null;
}

/** Whoever the playground is "signed in" as — the org owner. */
export interface Session {
  user: User;
  org: Org;
}
