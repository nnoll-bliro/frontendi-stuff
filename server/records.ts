import { getDb } from "./db.ts";
import type {
  AgentSession,
  AgentSessionDocumentation,
  AgentSessionSummary,
  CalendarEntry,
  CalendarParticipant,
  Company,
  CompanyRef,
  CompanySummary,
  KnowledgeItem,
  Meeting,
  MeetingParticipant,
  MeetingSummary,
  Org,
  Person,
  PersonRef,
  PersonSummary,
  Session,
  User,
} from "./types.ts";

type Row = Record<string, unknown>;
const str = (v: unknown) => String(v);
const nullable = (v: unknown) => (v == null ? null : String(v));
const rows = (sql: string, ...args: string[]) =>
  getDb()
    .prepare(sql)
    .all(...args) as Row[];
const row = (sql: string, ...args: string[]) =>
  getDb()
    .prepare(sql)
    .get(...args) as Row | undefined;

function toUser(r: Row): User {
  return {
    id: str(r.id),
    orgId: str(r.org_id),
    name: str(r.name),
    email: str(r.email),
    jobTitle: nullable(r.job_title),
    role: r.role as User["role"],
    provider: r.provider as User["provider"],
    createdAt: str(r.created_at),
  };
}

export function getSession(): Session {
  const r = row("SELECT * FROM orgs LIMIT 1")!;
  const org: Org = {
    id: str(r.id),
    name: str(r.name),
    domain: str(r.domain),
    plan: r.plan as Org["plan"],
    createdAt: str(r.created_at),
  };
  return {
    org,
    user: toUser(row("SELECT * FROM users WHERE role = 'owner' LIMIT 1")!),
  };
}
export const listUsers = (): User[] =>
  rows("SELECT * FROM users ORDER BY created_at").map(toUser);

function companyRef(id: unknown): CompanyRef | null {
  if (id == null) return null;
  const r = row("SELECT id, name FROM companies WHERE id = ?", str(id));
  return r ? { id: str(r.id), name: str(r.name) } : null;
}
const personRef = (r: Row): PersonRef => ({ id: str(r.id), name: str(r.name) });
const toCompany = (r: Row): CompanySummary => ({
  id: str(r.id),
  name: str(r.name),
  domain: str(r.domain),
  overview: str(r.overview),
});
const toPerson = (r: Row): PersonSummary => ({
  ...personRef(r),
  email: str(r.email),
  jobTitle: str(r.job_title),
  overview: str(r.overview),
  company: companyRef(r.company_id),
});
export const listCompanies = (): CompanySummary[] =>
  rows("SELECT * FROM companies ORDER BY name").map(toCompany);
export const listPeople = (): PersonSummary[] =>
  rows("SELECT * FROM people ORDER BY name").map(toPerson);

function knowledgeFor(
  scope: "company_id" | "person_id",
  id: string,
): KnowledgeItem[] {
  return rows(
    `SELECT * FROM knowledge_items WHERE ${scope} = ? ORDER BY id`,
    id,
  ).map((r) => ({
    id: str(r.id),
    kind: r.kind as KnowledgeItem["kind"],
    title: str(r.title),
    content: str(r.content),
  }));
}

export function getCompany(id: string): Company | null {
  const r = row("SELECT * FROM companies WHERE id = ?", id);
  return r
    ? {
        ...toCompany(r),
        people: rows(
          "SELECT * FROM people WHERE company_id = ? ORDER BY name",
          id,
        ).map(toPerson),
        meetings: listMeetings(new URLSearchParams({ companyId: id })),
        agentSessions: listAgentSessions(
          new URLSearchParams({ companyId: id }),
        ),
        knowledge: knowledgeFor("company_id", id),
      }
    : null;
}
export function getPerson(id: string): Person | null {
  const r = row("SELECT * FROM people WHERE id = ?", id);
  return r
    ? {
        ...toPerson(r),
        meetings: listMeetings(new URLSearchParams({ personId: id })),
        agentSessions: listAgentSessions(new URLSearchParams({ personId: id })),
        knowledge: knowledgeFor("person_id", id),
      }
    : null;
}

function meetingParticipants(id: string): MeetingParticipant[] {
  return rows(
    "SELECT * FROM meeting_participants WHERE meeting_id = ? ORDER BY name, id",
    id,
  ).map((r) => ({
    id: str(r.id),
    personId: nullable(r.person_id),
    userId: nullable(r.user_id),
    name: str(r.name),
    email: str(r.email),
  }));
}
function toMeetingSummary(r: Row): MeetingSummary {
  const id = str(r.id);
  const participants = meetingParticipants(id);
  const transcript = row(
    "SELECT status FROM meeting_transcripts WHERE meeting_id = ?",
    id,
  );
  return {
    id,
    orgId: str(r.org_id),
    ownerId: str(r.owner_id),
    ownerName: str(r.owner_name),
    calendarEntryId: nullable(r.calendar_entry_id),
    title: str(r.title),
    startedAt: str(r.started_at),
    durationMinutes: Number(r.duration_minutes),
    source: r.source as MeetingSummary["source"],
    status: r.status as MeetingSummary["status"],
    kind: r.kind as MeetingSummary["kind"],
    overview: str(r.overview),
    company: companyRef(r.company_id),
    participants,
    participantCount: participants.length,
    people: rows(
      `SELECT DISTINCT p.id, p.name FROM people p JOIN meeting_participants mp ON mp.person_id = p.id
      WHERE mp.meeting_id = ? ORDER BY p.name`,
      id,
    ).map(personRef),
    transcriptStatus: transcript
      ? (transcript.status as MeetingSummary["transcriptStatus"])
      : null,
    hasDocumentation: !!row(
      "SELECT id FROM meeting_documentation WHERE meeting_id = ? LIMIT 1",
      id,
    ),
  };
}
export function listMeetings(params = new URLSearchParams()): MeetingSummary[] {
  const where: string[] = [];
  const args: string[] = [];
  const add = (sql: string, value: string | null | undefined) => {
    if (value) {
      where.push(sql);
      args.push(value);
    }
  };
  const q = params.get("q")?.trim();
  add("m.title LIKE ?", q ? `%${q}%` : null);
  const status = params.get("status");
  add("m.status = ?", status === "all" ? null : status);
  add("m.owner_id = ?", params.get("ownerId"));
  add("m.company_id = ?", params.get("companyId"));
  add(
    "EXISTS (SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = m.id AND mp.person_id = ?)",
    params.get("personId"),
  );
  return rows(
    `SELECT m.*, u.name AS owner_name FROM meetings m JOIN users u ON u.id = m.owner_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY m.started_at DESC, m.id`,
    ...args,
  ).map(toMeetingSummary);
}
export function getMeeting(id: string): Meeting | null {
  const r = row(
    "SELECT m.*, u.name AS owner_name FROM meetings m JOIN users u ON u.id = m.owner_id WHERE m.id = ?",
    id,
  );
  if (!r) return null;
  const t = row("SELECT * FROM meeting_transcripts WHERE meeting_id = ?", id);
  return {
    ...toMeetingSummary(r),
    transcript: t
      ? {
          id: str(t.id),
          status: t.status as NonNullable<Meeting["transcript"]>["status"],
          language: str(t.language),
          segments: rows(
            "SELECT * FROM transcript_segments WHERE meeting_id = ? ORDER BY position, id",
            id,
          ).map((s) => ({
            id: str(s.id),
            position: Number(s.position),
            speaker: str(s.speaker),
            startMs: Number(s.start_ms),
            text: str(s.text),
          })),
        }
      : null,
    documentation: rows(
      "SELECT * FROM meeting_documentation WHERE meeting_id = ? ORDER BY id",
      id,
    ).map((d) => ({
      id: str(d.id),
      source: d.source as Meeting["documentation"][number]["source"],
      status: d.status as Meeting["documentation"][number]["status"],
      title: str(d.title),
      content: nullable(d.content),
      agentSessionId: nullable(d.agent_session_id),
    })),
    agentSessions: listAgentSessions(new URLSearchParams({ meetingId: id })),
    calendarEntry: r.calendar_entry_id
      ? getCalendarEntry(str(r.calendar_entry_id))
      : null,
  };
}

function toAgentSession(r: Row): AgentSessionSummary {
  const meeting = r.meeting_id
    ? row("SELECT id, title FROM meetings WHERE id = ?", str(r.meeting_id))
    : undefined;
  return {
    id: str(r.id),
    title: str(r.title),
    channel: r.channel as AgentSessionSummary["channel"],
    startedAt: str(r.started_at),
    overview: str(r.overview),
    company: companyRef(r.company_id),
    meeting: meeting
      ? { id: str(meeting.id), title: str(meeting.title) }
      : null,
    people: rows(
      `SELECT p.id, p.name FROM people p JOIN agent_session_people sp ON sp.person_id = p.id
      WHERE sp.session_id = ? ORDER BY p.name`,
      str(r.id),
    ).map(personRef),
  };
}
export function listAgentSessions(
  params = new URLSearchParams(),
): AgentSessionSummary[] {
  const where: string[] = [];
  const args: string[] = [];
  for (const [param, sql] of [
    ["companyId", "s.company_id = ?"],
    ["meetingId", "s.meeting_id = ?"],
    [
      "personId",
      "EXISTS (SELECT 1 FROM agent_session_people sp WHERE sp.session_id = s.id AND sp.person_id = ?)",
    ],
  ]) {
    const value = params.get(param);
    if (value) {
      where.push(sql);
      args.push(value);
    }
  }
  return rows(
    `SELECT s.* FROM agent_sessions s ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY s.started_at DESC, s.id`,
    ...args,
  ).map(toAgentSession);
}
export function getAgentSession(id: string): AgentSession | null {
  const r = row("SELECT * FROM agent_sessions WHERE id = ?", id);
  return r
    ? {
        ...toAgentSession(r),
        messages: rows(
          "SELECT * FROM agent_messages WHERE session_id = ? ORDER BY position",
          id,
        ).map((m) => ({
          id: str(m.id),
          position: Number(m.position),
          role: m.role as AgentSession["messages"][number]["role"],
          text: str(m.text),
        })),
        // The reverse of meeting documentation's provenance link: what this
        // conversation produced, on the meeting it describes.
        documentation: rows(
          `SELECT d.*, m.title AS meeting_title FROM meeting_documentation d
          JOIN meetings m ON m.id = d.meeting_id
          WHERE d.agent_session_id = ? ORDER BY d.id`,
          id,
        ).map((d) => ({
          id: str(d.id),
          source: d.source as AgentSessionDocumentation["source"],
          status: d.status as AgentSessionDocumentation["status"],
          title: str(d.title),
          content: nullable(d.content),
          meeting: { id: str(d.meeting_id), title: str(d.meeting_title) },
        })),
      }
    : null;
}

function toCalendarEntry(r: Row): CalendarEntry {
  const participants: CalendarParticipant[] = rows(
    `SELECT * FROM calendar_participants WHERE calendar_entry_id = ?
    ORDER BY is_organizer DESC, name`,
    str(r.id),
  ).map((p) => ({
    id: str(p.id),
    userId: nullable(p.user_id),
    name: str(p.name),
    email: str(p.email),
    company: nullable(p.company),
    response: p.response as CalendarParticipant["response"],
    isOrganizer: Boolean(p.is_organizer),
  }));
  return {
    id: str(r.id),
    orgId: str(r.org_id),
    organizerId: nullable(r.organizer_id),
    title: str(r.title),
    description: nullable(r.description),
    location: nullable(r.location),
    startsAt: str(r.starts_at),
    durationMinutes: Number(r.duration_minutes),
    provider: r.provider as CalendarEntry["provider"],
    isExternal: Boolean(r.is_external),
    participants,
    meetingId: nullable(r.meeting_id),
  };
}
export function listCalendar(params = new URLSearchParams()): CalendarEntry[] {
  const range = params.get("range") ?? "all";
  const where =
    range === "upcoming"
      ? "WHERE datetime(c.starts_at, '+' || c.duration_minutes || ' minutes') >= datetime(?)"
      : range === "past"
        ? "WHERE datetime(c.starts_at, '+' || c.duration_minutes || ' minutes') < datetime(?)"
        : "";
  return rows(
    `SELECT c.*, m.id AS meeting_id FROM calendar_entries c LEFT JOIN meetings m ON m.calendar_entry_id = c.id
    ${where} ORDER BY c.starts_at ${range === "past" ? "DESC" : "ASC"}`,
    ...(where ? [new Date().toISOString()] : []),
  ).map(toCalendarEntry);
}
export function getCalendarEntry(id: string): CalendarEntry | null {
  const r = row(
    `SELECT c.*, m.id AS meeting_id FROM calendar_entries c LEFT JOIN meetings m ON m.calendar_entry_id = c.id WHERE c.id = ?`,
    id,
  );
  return r ? toCalendarEntry(r) : null;
}
