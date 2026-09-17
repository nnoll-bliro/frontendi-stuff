# Glossary

Shared language for the lightweight CRM prototype.

## Terms

### Organization / Team user

The internal workspace (`orgs`) and its colleagues (`users`). Team users are not customer contacts. The seeded workspace is Vektor Mobility.

### Company

A customer or prospect organization (`companies`), distinct from the internal workspace. Its hub gathers its people, touchpoints, assistant conversations, and non-meeting knowledge. A company link is optional on a person, meeting, or agent session.

### Person

An external contact (`people`), not an internal Team user. A person's meeting history uses explicit participation; it does not include every meeting with their company. Assistant-session context is also explicitly linked. Avery Morgan illustrates a person without a company.

### Meeting / call / touchpoint

One canonical interaction, addressed as `/meetings/:id`, whether or not it was transcribed or documented. “Meetings” remains the navigation label and includes calls. `kind` distinguishes meeting/call; `source` describes calendar, ad hoc, or phone origin. Lifecycle (`scheduled`, `in_progress`, `held`, `cancelled`) is independent of artifact processing. Existing internal meeting examples are retained during migration; they do not enter customer histories without explicit links.

### Meeting participant

An explicit touchpoint participant (`meeting_participants`), with an optional link to a customer Person or an internal Team user. Name/email are snapshots. Participants and counts never depend on transcript speakers. Original calendar-backed examples are initialized once from non-declined invitees; calendar RSVP changes do not dynamically rewrite meeting participation. This is fixture mapping, not attendance detection or identity resolution.

### Transcript

An optional customer-meeting artifact (`meeting_transcripts` plus ordered `transcript_segments`). `null` means no transcript exists, not that processing is pending or failed. Transcript language and processing state belong to the artifact. Deleting an artifact does not delete its meeting or participants.

### Documentation

An optional artifact attached to the touchpoint it describes (`meeting_documentation`). Sources are Meeting summary, Phone Assistant, or Voice memo. Multiple documentation artifacts can describe the same meeting without creating duplicate touchpoints. Documentation may link to an agent session for provenance; that session's conversation is not the customer meeting's transcript.

### Artifact processing state

`collecting`, `processing`, `ready`, or `failed`, stored separately on transcripts and documentation. Existence does not imply readiness. These are static seeded examples, not a running recording/transcription pipeline.

### Agent session

A separate Call or Chat conversation with the assistant (`agent_sessions`, `agent_messages`), addressed as `/agent-sessions/:id`. It has explicit company/person context and an optional related meeting. A Phone Assistant debrief is an assistant call about a customer call, not a second customer touchpoint. Account-level chats can have no meeting link.

### Calendar entry

Scheduling/invite metadata, addressed as `/calendar/:id`. Calendar-entry IDs and meeting IDs are distinct. An entry optionally links to the same canonical meeting shown elsewhere; it does not imply a recording exists. This prototype supports at most one meeting per calendar entry.

### Knowledge / context

Non-meeting context (`knowledge_items`) owned by one company or one person: internal notes and illustrative revenue context. It is distinct from documentation of an individual meeting. Revenue examples are not computed forecasts or booked revenue.

### Company / Person hub

The canonical detail page for a company or person. Visible sections organize Overview, People (company only), Meetings, Agent Sessions, and Knowledge, followed by explicitly future Analysis and Sharing placeholders. Related records are links to their canonical URLs, not copied histories. A person's Company link sits in Overview; their history uses only explicit participation/context links.

### Newly encountered record

A manually seeded example of an early relationship, illustrated by Nordlicht Services and Mira Beck. No automatic company/person creation, matching, enrichment, or ingestion is implemented.

### Sharing / Analysis placeholder

A labeled future entry point only. It does not grant or enforce access, run analysis, or produce live results.
