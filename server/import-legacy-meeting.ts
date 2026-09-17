import type { DatabaseSync } from "node:sqlite";

/** One-time conversion shared by the original fixtures and the v0 DB migration. */
export interface LegacyMeeting {
  id: string;
  org_id: string;
  owner_id: string;
  calendar_entry_id: string | null;
  title: string;
  started_at: string;
  duration_minutes: number;
  source: string;
  status: string;
  language: string;
  summary: string | null;
}

export function importLegacyMeeting(db: DatabaseSync, m: LegacyMeeting): void {
  db.prepare(
    `INSERT INTO meetings
    (id, org_id, owner_id, calendar_entry_id, title, started_at, duration_minutes, source, status, kind, overview)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    m.id,
    m.org_id,
    m.owner_id,
    m.calendar_entry_id,
    m.title,
    m.started_at,
    m.duration_minutes,
    m.source,
    m.status === "recording" ? "in_progress" : "held",
    m.source === "phone" || m.id === "mtg_kestrel_adhoc" ? "call" : "meeting",
    m.title,
  );
  const artifactStatus =
    m.status === "recording"
      ? "collecting"
      : m.status === "completed"
        ? "ready"
        : m.status;
  db.prepare(
    `INSERT INTO meeting_transcripts (id, meeting_id, status, language)
    VALUES (?, ?, ?, ?)`,
  ).run(`tr_${m.id}`, m.id, artifactStatus, m.language);
  // Existing null summaries were pending artifacts, unlike new untranscribed touchpoints.
  db.prepare(
    `INSERT INTO meeting_documentation (id, meeting_id, source, status, title, content)
    VALUES (?, ?, 'meeting_summary', ?, 'Meeting summary', ?)`,
  ).run(
    `doc_${m.id}`,
    m.id,
    m.summary
      ? "ready"
      : artifactStatus === "ready"
        ? "processing"
        : artifactStatus,
    m.summary,
  );

  if (m.calendar_entry_id) {
    // Copy invite metadata once into independent touchpoint participants.
    db.prepare(
      `INSERT INTO meeting_participants (id, meeting_id, user_id, name, email)
      SELECT ? || '_p' || id, ?, user_id, name, email FROM calendar_participants
      WHERE calendar_entry_id = ? AND response != 'declined'`,
    ).run(m.id, m.id, m.calendar_entry_id);
  } else {
    // Do not derive contact identity or attendance from a transcript.
    db.prepare(
      `INSERT INTO meeting_participants (id, meeting_id, user_id, name, email)
      SELECT ? || '_owner', ?, id, name, email FROM users WHERE id = ?`,
    ).run(m.id, m.id, m.owner_id);
  }
}
