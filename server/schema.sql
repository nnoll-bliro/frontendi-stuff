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

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  overview TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  company_id TEXT REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT NOT NULL,
  overview TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id                TEXT PRIMARY KEY,
  org_id            TEXT NOT NULL REFERENCES orgs(id),
  owner_id          TEXT NOT NULL REFERENCES users(id),
  -- The whole point of the pairing: a meeting either came from a calendar entry
  -- or was started ad hoc, and the UI has to render both.
  calendar_entry_id TEXT UNIQUE REFERENCES calendar_entries(id),
  company_id        TEXT REFERENCES companies(id),
  kind              TEXT NOT NULL CHECK (kind IN ('meeting', 'call')),
  overview          TEXT NOT NULL,
  title             TEXT NOT NULL,
  started_at        TEXT NOT NULL,
  duration_minutes  INTEGER NOT NULL,
  source            TEXT NOT NULL,           -- calendar | ad_hoc | phone
  status            TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'held', 'cancelled'))
);

-- Participants belong to the touchpoint, never inferred from transcript speakers.
CREATE TABLE IF NOT EXISTS meeting_participants (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  person_id TEXT REFERENCES people(id),
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  CHECK (person_id IS NULL OR user_id IS NULL)
);

CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('collecting', 'processing', 'ready', 'failed')),
  language TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id),
  company_id TEXT REFERENCES companies(id),
  meeting_id TEXT REFERENCES meetings(id),
  title TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('call', 'chat')),
  started_at TEXT NOT NULL,
  overview TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_session_people (
  session_id TEXT NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES people(id),
  PRIMARY KEY (session_id, person_id)
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  UNIQUE (session_id, position)
);

CREATE TABLE IF NOT EXISTS meeting_documentation (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  agent_session_id TEXT REFERENCES agent_sessions(id),
  source TEXT NOT NULL CHECK (source IN ('meeting_summary', 'phone_assistant', 'voice_memo')),
  status TEXT NOT NULL CHECK (status IN ('collecting', 'processing', 'ready', 'failed')),
  title TEXT NOT NULL,
  content TEXT
);

-- Non-meeting context belongs to exactly one company or person.
CREATE TABLE IF NOT EXISTS knowledge_items (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  person_id TEXT REFERENCES people(id),
  kind TEXT NOT NULL CHECK (kind IN ('internal_note', 'revenue_context')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  CHECK ((company_id IS NOT NULL) != (person_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS transcript_segments (
  id          TEXT PRIMARY KEY,
  meeting_id  TEXT NOT NULL REFERENCES meeting_transcripts(meeting_id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_meeting_people ON meeting_participants (person_id, meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants ON meeting_participants (meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_company ON meetings (company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_company ON agent_sessions (company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_meeting ON agent_sessions (meeting_id);
CREATE INDEX IF NOT EXISTS idx_session_people ON agent_session_people (person_id, session_id);
CREATE INDEX IF NOT EXISTS idx_documentation_meeting ON meeting_documentation (meeting_id);
