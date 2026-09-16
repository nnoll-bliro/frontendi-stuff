-- Playground schema. Deliberately small and denormalised where it saves a join:
-- this exists to make mockups look like a real account, not to model the product.

CREATE TABLE IF NOT EXISTS orgs (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  domain      TEXT NOT NULL,
  plan        TEXT NOT NULL,            -- free | pro | enterprise
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL REFERENCES orgs(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  job_title   TEXT,
  role        TEXT NOT NULL,            -- owner | admin | member
  -- Which calendar this user connected, if any. Drives the "no calendar
  -- connected" empty states.
  provider    TEXT,                     -- google | microsoft | NULL
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_entries (
  id               TEXT PRIMARY KEY,
  org_id           TEXT NOT NULL REFERENCES orgs(id),
  organizer_id     TEXT REFERENCES users(id),   -- NULL when an external org invited us
  title            TEXT NOT NULL,
  description      TEXT,
  location         TEXT,
  starts_at        TEXT NOT NULL,              -- ISO 8601, UTC
  duration_minutes INTEGER NOT NULL,
  provider         TEXT NOT NULL,              -- google | microsoft
  is_external      INTEGER NOT NULL DEFAULT 0  -- has at least one guest outside the org
);

CREATE TABLE IF NOT EXISTS calendar_participants (
  id                 TEXT PRIMARY KEY,
  calendar_entry_id  TEXT NOT NULL REFERENCES calendar_entries(id) ON DELETE CASCADE,
  -- Set for colleagues, NULL for external guests: an invitee is an email address
  -- first and a user second.
  user_id            TEXT REFERENCES users(id),
  name               TEXT NOT NULL,
  email              TEXT NOT NULL,
  company            TEXT,
  response           TEXT NOT NULL,           -- accepted | declined | tentative | needs_action
  is_organizer       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meetings (
  id                TEXT PRIMARY KEY,
  org_id            TEXT NOT NULL REFERENCES orgs(id),
  owner_id          TEXT NOT NULL REFERENCES users(id),
  -- The whole point of the pairing: a meeting either came from a calendar entry
  -- or was started ad hoc, and the UI has to render both.
  calendar_entry_id TEXT REFERENCES calendar_entries(id),
  title             TEXT NOT NULL,
  started_at        TEXT NOT NULL,
  duration_minutes  INTEGER NOT NULL,
  source            TEXT NOT NULL,           -- calendar | ad_hoc | phone
  status            TEXT NOT NULL,           -- recording | processing | completed | failed
  language          TEXT NOT NULL,           -- en | de
  summary           TEXT                     -- markdown-ish; NULL until processed
);

CREATE TABLE IF NOT EXISTS transcript_segments (
  id          TEXT PRIMARY KEY,
  meeting_id  TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,        -- order within the transcript
  speaker     TEXT NOT NULL,
  start_ms    INTEGER NOT NULL,
  text        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_org           ON users (org_id);
CREATE INDEX IF NOT EXISTS idx_entries_starts_at   ON calendar_entries (starts_at);
CREATE INDEX IF NOT EXISTS idx_participants_entry  ON calendar_participants (calendar_entry_id);
CREATE INDEX IF NOT EXISTS idx_meetings_started_at ON meetings (started_at);
CREATE INDEX IF NOT EXISTS idx_segments_meeting    ON transcript_segments (meeting_id, position);
