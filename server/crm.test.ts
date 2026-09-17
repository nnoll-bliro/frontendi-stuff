import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { apiMiddleware } from "./api.ts";
import { getDb } from "./db.ts";
import { initializeDatabase } from "./migrate.ts";

const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const schemaV0 = readFileSync(
  new URL("./fixtures/schema-v0.sql", import.meta.url),
  "utf8",
);

type SqlRow = Record<string, unknown>;
type Json = Record<string, any>;

function openLegacyDatabase(
  options: {
    orgId?: string;
    userId?: string;
    meetingId?: string;
    calendarId?: string | null;
  } = {},
): DatabaseSync {
  const orgId = options.orgId ?? "org_acme";
  const userId = options.userId ?? "usr_acme";
  const meetingId = options.meetingId ?? "mtg_legacy";
  const calendarId =
    options.calendarId === undefined ? "cal_legacy" : options.calendarId;
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(schemaV0);
  db.prepare("INSERT INTO orgs VALUES (?, ?, ?, ?, ?)").run(
    orgId,
    orgId === "org_vektor" ? "Vektor Mobility" : "Acme Field Service",
    orgId === "org_vektor" ? "vektor-mobility.de" : "acme.example",
    "pro",
    "2024-01-01T00:00:00.000Z",
  );
  db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    userId,
    orgId,
    "Legacy Owner",
    "owner@acme.example",
    "Owner",
    "owner",
    "google",
    "2024-01-01T00:00:00.000Z",
  );
  if (calendarId) {
    db.prepare(
      "INSERT INTO calendar_entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      calendarId,
      orgId,
      userId,
      "Legacy calendar title",
      "Keep this description",
      "Old room",
      "2024-02-01T10:00:00.000Z",
      45,
      "google",
      1,
    );
    const participant = db.prepare(
      "INSERT INTO calendar_participants VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    participant.run(
      "calp_owner",
      calendarId,
      userId,
      "Legacy Owner",
      "owner@acme.example",
      "Acme Field Service",
      "accepted",
      1,
    );
    participant.run(
      "calp_guest",
      calendarId,
      null,
      "Casey Customer",
      "casey@customer.example",
      "Customer Ltd",
      "accepted",
      0,
    );
    participant.run(
      "calp_declined",
      calendarId,
      null,
      "Declined Guest",
      "no@example.com",
      "No Ltd",
      "declined",
      0,
    );
  }
  db.prepare(
    "INSERT INTO meetings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(
    meetingId,
    orgId,
    userId,
    calendarId,
    "Legacy meeting title",
    "2024-02-01T10:02:00.000Z",
    43,
    "calendar",
    "completed",
    "en",
    "Legacy summary that must survive",
  );
  db.prepare("INSERT INTO transcript_segments VALUES (?, ?, ?, ?, ?, ?)").run(
    "seg_legacy",
    meetingId,
    0,
    "Casey Customer",
    1200,
    "Legacy transcript that must survive",
  );
  return db;
}

function tableColumns(db: DatabaseSync, table: string): string[] {
  return (
    db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  ).map(({ name }) => name);
}

function scalar(db: DatabaseSync, sql: string): number {
  return Number((db.prepare(sql).get() as { value: number }).value);
}

test("initializeDatabase creates and seeds a fresh v1 database", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys = ON");
    initializeDatabase(db, schema);

    assert.equal(
      (db.prepare("PRAGMA user_version").get() as { user_version: number })
        .user_version,
      1,
    );
    assert.equal(scalar(db, "SELECT COUNT(*) AS value FROM orgs"), 1);
    assert.ok(scalar(db, "SELECT COUNT(*) AS value FROM meetings") > 0);
    assert.ok(scalar(db, "SELECT COUNT(*) AS value FROM companies") > 0);
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
    assert.ok(tableColumns(db, "meetings").includes("overview"));
    assert.ok(!tableColumns(db, "meetings").includes("summary"));
  } finally {
    db.close();
  }
});

test("v1 initialization is idempotent and does not execute schema or reseed", () => {
  const db = new DatabaseSync(":memory:");
  try {
    initializeDatabase(db, schema);
    const before = scalar(db, "SELECT COUNT(*) AS value FROM meetings");
    db.prepare("UPDATE orgs SET name = 'Persisted v1 edit'").run();

    assert.doesNotThrow(() =>
      initializeDatabase(db, "this is deliberately not SQL"),
    );
    assert.equal(scalar(db, "SELECT COUNT(*) AS value FROM meetings"), before);
    assert.equal(
      (db.prepare("SELECT name FROM orgs").get() as { name: string }).name,
      "Persisted v1 edit",
    );
  } finally {
    db.close();
  }
});

test("v0 migration preserves IDs, summaries, transcripts, calendar data, and foreign keys", () => {
  const db = openLegacyDatabase();
  try {
    initializeDatabase(db, schema);

    const meeting = db
      .prepare("SELECT * FROM meetings WHERE id = 'mtg_legacy'")
      .get() as SqlRow;
    assert.equal(meeting.id, "mtg_legacy");
    assert.equal(meeting.calendar_entry_id, "cal_legacy");
    assert.equal(meeting.status, "held");
    assert.equal(meeting.title, "Legacy meeting title");

    const documentation = db
      .prepare(
        "SELECT * FROM meeting_documentation WHERE meeting_id = 'mtg_legacy'",
      )
      .get() as SqlRow;
    assert.equal(documentation.id, "doc_mtg_legacy");
    assert.equal(documentation.content, "Legacy summary that must survive");
    assert.equal(documentation.status, "ready");
    assert.deepEqual(
      {
        ...(db
          .prepare(
            "SELECT id, meeting_id, position, speaker, start_ms, text FROM transcript_segments",
          )
          .get() as SqlRow),
      },
      {
        id: "seg_legacy",
        meeting_id: "mtg_legacy",
        position: 0,
        speaker: "Casey Customer",
        start_ms: 1200,
        text: "Legacy transcript that must survive",
      },
    );
    assert.equal(
      (
        db
          .prepare(
            "SELECT status FROM meeting_transcripts WHERE meeting_id = 'mtg_legacy'",
          )
          .get() as SqlRow
      ).status,
      "ready",
    );

    const calendar = db
      .prepare("SELECT * FROM calendar_entries WHERE id = 'cal_legacy'")
      .get() as SqlRow;
    assert.equal(calendar.description, "Keep this description");
    assert.equal(
      scalar(db, "SELECT COUNT(*) AS value FROM calendar_participants"),
      3,
    );
    assert.deepEqual(
      (
        db.prepare("SELECT id FROM meeting_participants ORDER BY id").all() as {
          id: string;
        }[]
      ).map((row) => row.id),
      ["mtg_legacy_pcalp_guest", "mtg_legacy_pcalp_owner"],
    );
    assert.equal(
      scalar(db, "SELECT COUNT(*) AS value FROM companies"),
      0,
      "non-Vektor databases must not receive fictional CRM fixtures",
    );
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
    assert.equal(
      (db.prepare("PRAGMA user_version").get() as { user_version: number })
        .user_version,
      1,
    );
  } finally {
    db.close();
  }
});

test("a v0 Vektor database receives the CRM upgrade without losing legacy data", () => {
  const db = openLegacyDatabase({
    orgId: "org_vektor",
    userId: "usr_lena",
    meetingId: "mtg_existing",
    calendarId: null,
  });
  try {
    initializeDatabase(db, schema);

    assert.equal(
      (
        db
          .prepare(
            "SELECT content FROM meeting_documentation WHERE meeting_id = 'mtg_existing'",
          )
          .get() as SqlRow
      ).content,
      "Legacy summary that must survive",
    );
    assert.equal(
      (
        db
          .prepare("SELECT name FROM companies WHERE id = 'co_halden'")
          .get() as SqlRow
      ).name,
      "Halden Logistics",
    );
    assert.ok(
      db.prepare("SELECT id FROM meetings WHERE id = 'mtg_halden_depot'").get(),
    );
    assert.ok(
      db
        .prepare(
          "SELECT id FROM people WHERE id = 'per_avery' AND company_id IS NULL",
        )
        .get(),
    );
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally {
    db.close();
  }
});

test("failed migration rolls back all schema and data changes", () => {
  const db = openLegacyDatabase();
  try {
    // Valid in v0, but the v1 unique calendar relationship makes conversion fail
    // after the old tables have been dropped and recreated inside the transaction.
    db.prepare(
      "INSERT INTO meetings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      "mtg_duplicate",
      "org_acme",
      "usr_acme",
      "cal_legacy",
      "Duplicate calendar link",
      "2024-02-02T10:00:00.000Z",
      10,
      "calendar",
      "completed",
      "en",
      "Second old summary",
    );

    assert.throws(
      () => initializeDatabase(db, schema),
      /UNIQUE constraint failed: meetings\.calendar_entry_id/,
    );
    assert.equal(
      (db.prepare("PRAGMA user_version").get() as { user_version: number })
        .user_version,
      0,
    );
    assert.ok(
      tableColumns(db, "meetings").includes("summary"),
      "the legacy meetings table must be restored",
    );
    assert.ok(!tableColumns(db, "meetings").includes("overview"));
    assert.equal(scalar(db, "SELECT COUNT(*) AS value FROM meetings"), 2);
    assert.equal(
      (
        db
          .prepare("SELECT summary FROM meetings WHERE id = 'mtg_legacy'")
          .get() as SqlRow
      ).summary,
      "Legacy summary that must survive",
    );
    assert.equal(
      scalar(db, "SELECT COUNT(*) AS value FROM transcript_segments"),
      1,
    );
    assert.equal(
      scalar(
        db,
        "SELECT COUNT(*) AS value FROM sqlite_master WHERE type = 'table' AND name = 'companies'",
      ),
      0,
    );
    assert.equal(
      (db.prepare("PRAGMA foreign_keys").get() as { foreign_keys: number })
        .foreign_keys,
      1,
    );
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally {
    db.close();
  }
});

test("legacy artifact states migrate independently from meeting lifecycle", () => {
  for (const [legacyStatus, lifecycle, artifact] of [
    ["recording", "in_progress", "collecting"],
    ["processing", "held", "processing"],
    ["failed", "held", "failed"],
  ]) {
    const db = openLegacyDatabase();
    try {
      db.prepare("UPDATE meetings SET status = ?, summary = NULL").run(
        legacyStatus,
      );
      initializeDatabase(db, schema);
      assert.equal(
        (db.prepare("SELECT status FROM meetings").get() as SqlRow).status,
        lifecycle,
      );
      assert.equal(
        (db.prepare("SELECT status FROM meeting_transcripts").get() as SqlRow)
          .status,
        artifact,
      );
      const doc = db
        .prepare("SELECT status, content FROM meeting_documentation")
        .get() as SqlRow;
      assert.equal(doc.status, artifact);
      assert.equal(doc.content, null);
      assert.equal(
        scalar(db, "SELECT COUNT(*) AS value FROM meeting_participants"),
        2,
      );
    } finally {
      db.close();
    }
  }
});

test("legacy transcript segments with equal positions are preserved, not merged", () => {
  const db = openLegacyDatabase();
  try {
    db.prepare("INSERT INTO transcript_segments VALUES (?, ?, ?, ?, ?, ?)").run(
      "seg_second",
      "mtg_legacy",
      0,
      "Legacy Owner",
      1300,
      "A distinct segment at the same position",
    );
    initializeDatabase(db, schema);
    assert.equal(
      scalar(db, "SELECT COUNT(*) AS value FROM transcript_segments"),
      2,
    );
    assert.equal(
      (
        db
          .prepare(
            "SELECT text FROM transcript_segments WHERE id = 'seg_second'",
          )
          .get() as SqlRow
      ).text,
      "A distinct segment at the same position",
    );
  } finally {
    db.close();
  }
});

test("removing transcript artifacts does not remove a meeting or its participants", () => {
  const db = new DatabaseSync(":memory:");
  try {
    initializeDatabase(db, schema);
    const before = db
      .prepare(
        "SELECT * FROM meeting_participants WHERE meeting_id = 'mtg_halden_discovery' ORDER BY id",
      )
      .all();
    db.prepare(
      "DELETE FROM meeting_transcripts WHERE meeting_id = 'mtg_halden_discovery'",
    ).run();
    assert.equal(
      scalar(
        db,
        "SELECT COUNT(*) AS value FROM transcript_segments WHERE meeting_id = 'mtg_halden_discovery'",
      ),
      0,
    );
    assert.ok(
      db
        .prepare("SELECT id FROM meetings WHERE id = 'mtg_halden_discovery'")
        .get(),
    );
    assert.deepEqual(
      db
        .prepare(
          "SELECT * FROM meeting_participants WHERE meeting_id = 'mtg_halden_discovery' ORDER BY id",
        )
        .all(),
      before,
    );
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally {
    db.close();
  }
});

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return address.port;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

test("HTTP API exposes canonical CRM relationships and remains read-only", async (t) => {
  const temporaryServerDir = mkdtempSync(join(tmpdir(), "bliro-crm-test-"));
  copyFileSync(
    new URL("./schema.sql", import.meta.url),
    join(temporaryServerDir, "schema.sql"),
  );
  process.env.BLIRO_SERVER_DIR = temporaryServerDir;

  const server = createServer((req, res) =>
    apiMiddleware(req, res, () => {
      res.statusCode = 404;
      res.end("Not found");
    }),
  );
  const port = await listen(server);
  const base = `http://127.0.0.1:${port}`;
  const request = async (
    path: string,
    init?: RequestInit,
  ): Promise<{ status: number; body: any }> => {
    const response = await fetch(`${base}${path}`, init);
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  };
  const ok = async (path: string): Promise<any> => {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} should return 200`);
    return response.body;
  };

  try {
    await t.test(
      "hub and detail IDs refer to the same Halden records",
      async () => {
        const [companies, people, meetings, sessions, company, anke] =
          await Promise.all([
            ok("/api/companies"),
            ok("/api/people"),
            ok("/api/meetings"),
            ok("/api/agent-sessions"),
            ok("/api/companies/co_halden"),
            ok("/api/people/per_anke"),
          ]);
        assert.deepEqual(
          companies.find((item: Json) => item.id === company.id),
          {
            id: company.id,
            name: company.name,
            domain: company.domain,
            overview: company.overview,
          },
        );
        for (const person of company.people) {
          assert.deepEqual(
            people.find((item: Json) => item.id === person.id),
            person,
          );
        }
        for (const meeting of company.meetings) {
          assert.deepEqual(
            meetings.find((item: Json) => item.id === meeting.id),
            meeting,
          );
        }
        for (const session of company.agentSessions) {
          assert.deepEqual(
            sessions.find((item: Json) => item.id === session.id),
            session,
          );
        }
        assert.equal(anke.id, "per_anke");
        assert.equal(
          people.find((item: Json) => item.id === "per_anke").name,
          anke.name,
        );
      },
    );

    await t.test(
      "person history is membership-based and company-less people stay company-less",
      async () => {
        const [anke, avery, people] = await Promise.all([
          ok("/api/people/per_anke"),
          ok("/api/people/per_avery"),
          ok("/api/people"),
        ]);
        assert.deepEqual(
          new Set(anke.meetings.map((item: Json) => item.id)),
          new Set(["mtg_halden_discovery", "mtg_halden_kickoff"]),
        );
        assert.ok(
          !anke.meetings.some((item: Json) => item.id === "mtg_halden_depot"),
        );
        assert.deepEqual(
          anke.agentSessions.map((item: Json) => item.id),
          ["as_halden_plan"],
        );
        assert.ok(
          !anke.agentSessions.some(
            (item: Json) => item.id === "as_halden_debrief",
          ),
        );
        assert.equal(avery.company, null);
        assert.equal(
          people.find((item: Json) => item.id === "per_avery").company,
          null,
        );
        assert.deepEqual(
          avery.meetings.map((item: Json) => item.id),
          ["mtg_avery_advice"],
        );
      },
    );

    await t.test(
      "untranscribed touchpoints retain participants and documentation provenance",
      async () => {
        const cases = [
          ["mtg_halden_depot", "phone_assistant", "as_halden_debrief"],
          ["mtg_nordlicht_intro", "voice_memo", "as_nordlicht_memo"],
          ["mtg_avery_advice", null, null],
        ] as const;
        for (const [meetingId, source, sessionId] of cases) {
          const meeting = await ok(`/api/meetings/${meetingId}`);
          assert.equal(meeting.transcript, null);
          assert.equal(meeting.participantCount, 2);
          assert.equal(meeting.participants.length, 2);
          assert.ok(
            meeting.participants.some(
              (participant: Json) => participant.personId,
            ),
          );
          assert.ok(
            meeting.participants.some(
              (participant: Json) => participant.userId === "usr_lena",
            ),
          );
          if (source && sessionId) {
            const documentation = meeting.documentation.find(
              (item: Json) => item.source === source,
            );
            assert.equal(documentation.agentSessionId, sessionId);
            const session = await ok(`/api/agent-sessions/${sessionId}`);
            assert.equal(session.meeting.id, meetingId);
            assert.ok(session.messages.length >= 2);
            assert.notEqual(
              documentation.content,
              session.messages.map((message: Json) => message.text).join("\n"),
            );
            // The session names what it documented; the artifact stays on the meeting.
            const produced = session.documentation.find(
              (item: Json) => item.id === documentation.id,
            );
            assert.equal(produced.meeting.id, meetingId);
            assert.equal(produced.source, source);
            assert.equal(produced.content, documentation.content);
          } else {
            assert.deepEqual(meeting.documentation, []);
          }
        }
        const standalone = await ok("/api/agent-sessions/as_halden_plan");
        assert.equal(standalone.meeting, null);
        assert.ok(standalone.messages.length >= 2);
        assert.deepEqual(standalone.documentation, []);
      },
    );

    await t.test(
      "transcribed and processing meetings expose artifact state separately",
      async () => {
        const completed = await ok("/api/meetings/mtg_halden_discovery");
        assert.equal(completed.status, "held");
        assert.equal(completed.transcript.status, "ready");
        assert.ok(completed.transcript.segments.length > 0);
        const processing = await ok("/api/meetings/mtg_halden_kickoff");
        assert.equal(processing.status, "held");
        assert.equal(processing.transcript.status, "processing");
        assert.equal(processing.documentation[0].status, "processing");
        assert.equal(processing.documentation[0].content, null);
        assert.ok(processing.participants.length > 0);
      },
    );

    await t.test(
      "known detail routes return records and unknown routes return 404",
      async () => {
        for (const [route, id] of [
          ["companies", "co_halden"],
          ["people", "per_anke"],
          ["meetings", "mtg_halden_discovery"],
          ["agent-sessions", "as_halden_plan"],
          ["calendar", "cal_halden_discovery"],
        ]) {
          const known = await request(`/api/${route}/${id}`);
          assert.equal(known.status, 200);
          assert.equal(known.body.id, id);
          const unknown = await request(`/api/${route}/does-not-exist`);
          assert.equal(unknown.status, 404);
          assert.deepEqual(unknown.body, { error: "Not found" });
        }
      },
    );

    await t.test(
      "calendar rows point to one distinct canonical meeting",
      async () => {
        const [calendar, meetings, entry, meeting] = await Promise.all([
          ok("/api/calendar?range=all"),
          ok("/api/meetings"),
          ok("/api/calendar/cal_halden_discovery"),
          ok("/api/meetings/mtg_halden_discovery"),
        ]);
        assert.equal(
          new Set(calendar.map((item: Json) => item.id)).size,
          calendar.length,
        );
        assert.equal(
          new Set(meetings.map((item: Json) => item.id)).size,
          meetings.length,
        );
        const linked = calendar.filter((item: Json) => item.meetingId !== null);
        assert.equal(
          new Set(linked.map((item: Json) => item.meetingId)).size,
          linked.length,
        );
        assert.ok(linked.every((item: Json) => item.id !== item.meetingId));
        assert.equal(entry.meetingId, "mtg_halden_discovery");
        assert.equal(meeting.calendarEntryId, entry.id);
        assert.equal(meeting.calendarEntry.id, entry.id);
        assert.equal(
          meetings.filter((item: Json) => item.calendarEntryId === entry.id)
            .length,
          1,
        );
      },
    );

    await t.test(
      "meeting search, status, company, and person filters are applied",
      async () => {
        const [all, search, held, progress, company, person, missing] =
          await Promise.all([
            ok("/api/meetings?status=all"),
            ok("/api/meetings?q=Halden"),
            ok("/api/meetings?status=held"),
            ok("/api/meetings?status=in_progress"),
            ok("/api/meetings?companyId=co_halden"),
            ok("/api/meetings?personId=per_anke"),
            ok("/api/meetings?q=no-such-meeting"),
          ]);
        assert.ok(all.length > held.length);
        assert.ok(
          search.length > 0 &&
            search.every((item: Json) => item.title.includes("Halden")),
        );
        assert.ok(
          held.length > 0 && held.every((item: Json) => item.status === "held"),
        );
        assert.deepEqual(
          progress.map((item: Json) => item.id),
          ["mtg_orbit_contract"],
        );
        assert.deepEqual(
          new Set(company.map((item: Json) => item.id)),
          new Set([
            "mtg_halden_discovery",
            "mtg_halden_kickoff",
            "mtg_halden_depot",
          ]),
        );
        assert.deepEqual(
          new Set(person.map((item: Json) => item.id)),
          new Set(["mtg_halden_discovery", "mtg_halden_kickoff"]),
        );
        assert.deepEqual(missing, []);
      },
    );

    await t.test(
      "write requests are rejected without changing persisted rows",
      async () => {
        const before = scalar(
          getDb(),
          "SELECT COUNT(*) AS value FROM meetings",
        );
        const response = await request("/api/meetings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: "Must not persist" }),
        });
        assert.equal(response.status, 404);
        assert.match(response.body.error, /No API route for POST/);
        assert.equal(
          scalar(getDb(), "SELECT COUNT(*) AS value FROM meetings"),
          before,
        );
        assert.equal(
          scalar(
            getDb(),
            "SELECT COUNT(*) AS value FROM meetings WHERE title = 'Must not persist'",
          ),
          0,
        );
      },
    );
  } finally {
    await closeServer(server);
    getDb().close();
    delete process.env.BLIRO_SERVER_DIR;
    rmSync(temporaryServerDir, { recursive: true, force: true });
  }
});
