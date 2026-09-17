import type { DatabaseSync } from "node:sqlite";

import {
  importLegacyMeeting,
  type LegacyMeeting,
} from "./import-legacy-meeting.ts";
import { seed } from "./seed.ts";
import { seedCrm } from "./seed-crm.ts";

/**
 * Upgrade the original seeded v0 prototype, preserving IDs and artifact content.
 * Custom v0 data with multiple meetings per invite is deliberately not merged:
 * it fails atomically for manual resolution rather than silently losing links.
 */
export function initializeDatabase(db: DatabaseSync, schema: string): void {
  const version = (
    db.prepare("PRAGMA user_version").get() as { user_version: number }
  ).user_version;
  if (version > 1)
    throw new Error(`Unsupported playground database version ${version}`);
  if (version === 1) return;

  const legacy = (
    db.prepare("PRAGMA table_info(meetings)").all() as { name: string }[]
  ).some((column) => column.name === "summary");
  // Rebuild only the two legacy tables. All statements, conversion and new seed
  // rows are atomic; a failure rolls back to the untouched old database.
  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    const meetings = legacy
      ? (db
          .prepare("SELECT * FROM meetings")
          .all() as unknown as LegacyMeeting[])
      : [];
    const segments = legacy
      ? db.prepare("SELECT * FROM transcript_segments").all()
      : [];
    if (legacy) db.exec("DROP TABLE transcript_segments; DROP TABLE meetings;");
    db.exec(schema);
    const count = (
      db.prepare("SELECT COUNT(*) AS count FROM orgs").get() as {
        count: number;
      }
    ).count;
    if (count === 0) {
      seed(db);
    } else if (legacy) {
      for (const meeting of meetings) importLegacyMeeting(db, meeting);
      const insert =
        db.prepare(`INSERT INTO transcript_segments (id, meeting_id, position, speaker, start_ms, text)
        VALUES (?, ?, ?, ?, ?, ?)`);
      for (const s of segments)
        insert.run(
          s.id,
          s.meeting_id,
          s.position,
          s.speaker,
          s.start_ms,
          s.text,
        );
      seedCrm(db);
    }
    if (db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error("Database migration failed foreign key validation");
    db.exec("PRAGMA user_version = 1; COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw new Error(
      `CRM prototype upgrade rolled back; existing data is unchanged. ` +
        `This migration supports the original v0 seed relationships (one meeting per calendar entry). ` +
        `Review conflicting/custom legacy records before retrying. Cause: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}
