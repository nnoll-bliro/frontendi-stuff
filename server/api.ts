import type { IncomingMessage, ServerResponse } from "node:http";

import { getDb } from "./db.ts";
import { serveFlag } from "./flags.ts";
import type {
  CalendarEntry,
  CalendarParticipant,
  Meeting,
  MeetingSummary,
  Org,
  Session,
  TranscriptSegment,
  User,
} from "./types.ts";

/* ---------------------------------------------------------------- row mapping */
/* node:sqlite hands back snake_case rows with 0/1 for booleans; every read goes
   through one of these so the client only ever sees the shapes in types.ts.    */

type Row = Record<string, unknown>;

const str = (v: unknown) => String(v);
const strOrNull = (v: unknown) => (v == null ? null : String(v));
const num = (v: unknown) => Number(v);
const bool = (v: unknown) => Boolean(Number(v));

function toOrg(r: Row): Org {
  return {
    id: str(r.id),
    name: str(r.name),
    domain: str(r.domain),
    plan: str(r.plan) as Org["plan"],
    createdAt: str(r.created_at),
  };
}

function toUser(r: Row): User {
  return {
    id: str(r.id),
    orgId: str(r.org_id),
    name: str(r.name),
    email: str(r.email),
    jobTitle: strOrNull(r.job_title),
    role: str(r.role) as User["role"],
    provider: strOrNull(r.provider) as User["provider"],
    createdAt: str(r.created_at),
  };
}

function toParticipant(r: Row): CalendarParticipant {
  return {
    id: str(r.id),
    userId: strOrNull(r.user_id),
    name: str(r.name),
    email: str(r.email),
    company: strOrNull(r.company),
    response: str(r.response) as CalendarParticipant["response"],
    isOrganizer: bool(r.is_organizer),
  };
}

function toSegment(r: Row): TranscriptSegment {
  return {
    id: str(r.id),
    position: num(r.position),
    speaker: str(r.speaker),
    startMs: num(r.start_ms),
    text: str(r.text),
  };
}

function toMeetingSummary(r: Row): MeetingSummary {
  return {
    id: str(r.id),
    orgId: str(r.org_id),
    ownerId: str(r.owner_id),
    ownerName: str(r.owner_name),
    calendarEntryId: strOrNull(r.calendar_entry_id),
    title: str(r.title),
    startedAt: str(r.started_at),
    durationMinutes: num(r.duration_minutes),
    source: str(r.source) as MeetingSummary["source"],
    status: str(r.status) as MeetingSummary["status"],
    language: str(r.language),
    hasSummary: r.summary != null,
    participantCount: num(r.participant_count),
  };
}

/* -------------------------------------------------------------------- queries */

/**
 * Ad-hoc meetings have no calendar entry to count invitees from, so fall back to
 * the number of distinct speakers the transcript actually picked up.
 */
const PARTICIPANT_COUNT = `
  CASE WHEN m.calendar_entry_id IS NULL
    THEN (SELECT COUNT(DISTINCT ts.speaker) FROM transcript_segments ts WHERE ts.meeting_id = m.id)
    ELSE (SELECT COUNT(*) FROM calendar_participants cp WHERE cp.calendar_entry_id = m.calendar_entry_id)
  END AS participant_count`;

function participantsFor(entryId: string): CalendarParticipant[] {
  return getDb()
    .prepare(
      `SELECT * FROM calendar_participants
       WHERE calendar_entry_id = ?
       ORDER BY is_organizer DESC, name`,
    )
    .all(entryId)
    .map((r) => toParticipant(r as Row));
}

function toCalendarEntry(r: Row): CalendarEntry {
  return {
    id: str(r.id),
    orgId: str(r.org_id),
    organizerId: strOrNull(r.organizer_id),
    title: str(r.title),
    description: strOrNull(r.description),
    location: strOrNull(r.location),
    startsAt: str(r.starts_at),
    durationMinutes: num(r.duration_minutes),
    provider: str(r.provider) as CalendarEntry["provider"],
    isExternal: bool(r.is_external),
    participants: participantsFor(str(r.id)),
    meetingId: strOrNull(r.meeting_id),
  };
}

function getSession(): Session {
  const db = getDb();
  const org = db.prepare("SELECT * FROM orgs LIMIT 1").get() as Row;
  const user = db.prepare("SELECT * FROM users WHERE role = 'owner' LIMIT 1").get() as Row;
  return { org: toOrg(org), user: toUser(user) };
}

function listUsers(): User[] {
  return getDb()
    .prepare("SELECT * FROM users ORDER BY created_at")
    .all()
    .map((r) => toUser(r as Row));
}

function listMeetings(params: URLSearchParams): MeetingSummary[] {
  const where: string[] = [];
  const args: string[] = [];

  const q = params.get("q")?.trim();
  if (q) {
    where.push("m.title LIKE ?");
    args.push(`%${q}%`);
  }
  const status = params.get("status");
  if (status && status !== "all") {
    where.push("m.status = ?");
    args.push(status);
  }
  const ownerId = params.get("ownerId");
  if (ownerId) {
    where.push("m.owner_id = ?");
    args.push(ownerId);
  }

  return getDb()
    .prepare(
      `SELECT m.*, u.name AS owner_name, ${PARTICIPANT_COUNT}
       FROM meetings m
       JOIN users u ON u.id = m.owner_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY m.started_at DESC`,
    )
    .all(...args)
    .map((r) => toMeetingSummary(r as Row));
}

function getMeeting(id: string): Meeting | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT m.*, u.name AS owner_name, ${PARTICIPANT_COUNT}
       FROM meetings m
       JOIN users u ON u.id = m.owner_id
       WHERE m.id = ?`,
    )
    .get(id) as Row | undefined;
  if (!row) return null;

  const transcript = db
    .prepare("SELECT * FROM transcript_segments WHERE meeting_id = ? ORDER BY position")
    .all(id)
    .map((r) => toSegment(r as Row));

  const entryId = strOrNull(row.calendar_entry_id);
  const entryRow = entryId
    ? (db
        .prepare(
          `SELECT c.*, m.id AS meeting_id
           FROM calendar_entries c
           LEFT JOIN meetings m ON m.calendar_entry_id = c.id
           WHERE c.id = ?`,
        )
        .get(entryId) as Row | undefined)
    : undefined;

  return {
    ...toMeetingSummary(row),
    summary: strOrNull(row.summary),
    transcript,
    calendarEntry: entryRow ? toCalendarEntry(entryRow) : null,
  };
}

function listCalendar(params: URLSearchParams): CalendarEntry[] {
  const range = params.get("range") ?? "all";
  const now = new Date().toISOString();

  // "upcoming" includes whatever is running right now, so a meeting in progress
  // doesn't vanish from the view the moment it starts.
  const where =
    range === "upcoming"
      ? "WHERE datetime(c.starts_at, '+' || c.duration_minutes || ' minutes') >= datetime(?)"
      : range === "past"
        ? "WHERE datetime(c.starts_at, '+' || c.duration_minutes || ' minutes') < datetime(?)"
        : "";
  const args = where ? [now] : [];

  return getDb()
    .prepare(
      `SELECT c.*, m.id AS meeting_id
       FROM calendar_entries c
       LEFT JOIN meetings m ON m.calendar_entry_id = c.id
       ${where}
       ORDER BY c.starts_at ${range === "past" ? "DESC" : "ASC"}`,
    )
    .all(...args)
    .map((r) => toCalendarEntry(r as Row));
}

function getCalendarEntry(id: string): CalendarEntry | null {
  const row = getDb()
    .prepare(
      `SELECT c.*, m.id AS meeting_id
       FROM calendar_entries c
       LEFT JOIN meetings m ON m.calendar_entry_id = c.id
       WHERE c.id = ?`,
    )
    .get(id) as Row | undefined;
  return row ? toCalendarEntry(row) : null;
}

/* ------------------------------------------------------------------ the route */

type Handler = (params: URLSearchParams, match: RegExpMatchArray) => unknown;

const ROUTES: [method: string, pattern: RegExp, handler: Handler][] = [
  ["GET", /^\/api\/session$/, () => getSession()],
  ["GET", /^\/api\/users$/, () => listUsers()],
  ["GET", /^\/api\/meetings$/, (params) => listMeetings(params)],
  ["GET", /^\/api\/meetings\/([\w-]+)$/, (_p, m) => getMeeting(m[1])],
  ["GET", /^\/api\/calendar$/, (params) => listCalendar(params)],
  ["GET", /^\/api\/calendar\/([\w-]+)$/, (_p, m) => getCalendarEntry(m[1])],
];

/**
 * Connect-style middleware — Vite mounts it in `configureServer`, so the API and
 * the app share one origin and one `npm run dev`. Anything that isn't `/api/*`
 * falls through to Vite untouched.
 */
export function apiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (serveFlag(url.pathname, res)) return;
  if (!url.pathname.startsWith("/api/")) return next();

  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // The database is seeded once per process; never let the browser cache reads.
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
  };

  const route = ROUTES.find(([method, pattern]) => {
    return req.method === method && pattern.test(url.pathname);
  });
  if (!route) return send(404, { error: `No API route for ${req.method} ${url.pathname}` });

  try {
    const match = url.pathname.match(route[1]);
    const result = route[2](url.searchParams, match as RegExpMatchArray);
    if (result === null) return send(404, { error: "Not found" });
    send(200, result);
  } catch (error) {
    // Surfaced in the browser rather than only in the terminal — a mockup that
    // silently renders nothing is worse than one showing the SQL error.
    console.error(`[api] ${req.method} ${url.pathname} failed:`, error);
    send(500, { error: error instanceof Error ? error.message : String(error) });
  }
}
