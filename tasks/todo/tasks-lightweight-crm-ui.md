# Lightweight CRM — UI concepts and navigation

## Goal

Build a read-only, navigable prototype that makes companies, people, meetings/calls, transcripts, and agent sessions understandable as distinct, connected concepts. Validate routing and information hierarchy, not detailed interactions or production behavior.

## Decisions

- Companies, People, Meetings, and Agent Sessions are all top-level sidebar destinations.
- Company and Person detail pages are hubs for overview, meetings, agent sessions, and knowledge/context.
- A **meeting/call** is a touchpoint that exists whether or not it was transcribed. Keep “Meetings” as the navigation label for now; it includes calls.
- A **transcript** is an optional artifact of a meeting, not the meeting itself.
- An **agent session** is a separate conversation with the assistant via call or chat. It can be about a meeting, but is not itself automatically a customer meeting.
- Phone Assistant and voice-memo documentation belong with the customer touchpoint they describe, rather than forming separate customer histories. An assistant call's own conversation is not the customer's meeting transcript.
- Read-only seeded examples only: no create/edit/delete, automatic record creation, recording, or actual assistant execution.
- Sharing rules and AI analysis get clearly labeled placeholders/entry points only.

## Proposed routing

Use canonical record URLs regardless of which hub links to them. The section names below describe page hierarchy; they do not require separate routes or a specific tab design yet.

| Route | Purpose / hierarchy |
| --- | --- |
| `/companies` | Company directory |
| `/companies/:id` | Overview, People, Meetings, Agent Sessions, Knowledge, Analysis placeholder |
| `/people` | People directory; separate from internal Team members |
| `/people/:id` | Overview, linked Company, Meetings, Agent Sessions, Knowledge, Analysis placeholder |
| `/meetings` | Customer touchpoints, including calls and untranscribed meetings |
| `/meetings/:id` | Touchpoint overview, Company/People, documentation, optional Transcript, related Agent Sessions |
| `/agent-sessions` | Assistant conversations, labeled Call or Chat |
| `/agent-sessions/:id` | Session overview/content, Company/People context, optional related Meeting |
| `/calendar` | Existing schedule view; links to the same meeting records, not a second touchpoint history |
| `/calendar/:id` | Existing calendar/invite metadata view; links to its meeting when represented |
| `/settings/sharing` | Organization sharing-policy placeholder only |

Keep `/team`, `/settings/account`, and `/design-system` available. Keep `/` redirecting to `/meetings` for now. Calendar-entry IDs and meeting IDs remain distinct; a calendar entry is scheduling metadata, not a recording.

## Relevant Files

- `src/routes/RootLayout.tsx`, `src/routes/router.tsx` — grouped sidebar, shell routes, and existing route loaders.
- `src/routes/CrmRouteShell.tsx` — temporary Companies, People, and Agent Sessions list/detail shells; replace with data-backed pages in later tickets.
- `src/routes/SettingsLayout.tsx`, `src/routes/SettingsSharingPage.tsx` — Settings navigation and nonfunctional Sharing placeholder.
- `tasks/changelog.md` — dated implementation outcomes and decisions.
- `src/routes/MeetingsPage.tsx`, `src/routes/MeetingDetailPage.tsx` — currently frame meetings as recordings.
- `src/routes/CalendarPage.tsx`, `src/routes/CalendarEntryPage.tsx` — calendar-to-meeting navigation.
- `src/components/playground/` — reusable page, card, and empty-state components.
- `server/types.ts`, `server/schema.sql`, `server/seed.ts` — shared prototype model and fixtures.
- `server/api.ts`, `server/db.ts`, `src/api/client.ts` — read-only data access shared across routes.

## Tickets

- [x] 1.0 **App navigation and route skeleton**
  - [x] 1.1 Add Companies, People, Meetings, and Agent Sessions as primary sidebar destinations. Retain Calendar and visually separate Team/Settings and the design-system utility.
  - [x] 1.2 Register list/detail route shells from the proposed map, with consistent page headings, section highlighting, and list-return navigation.
  - [x] 1.3 Add a Sharing entry under Settings, clearly marked as a future capability; no policy controls.
  - **Done when:** All primary destinations are reachable, direct detail URLs resolve to a shell, and the sidebar keeps the correct section highlighted.
  - **Boundary:** Navigation and page skeletons only; no dashboard redesign or detailed interactions.
  - **Validated:** Production build/typecheck and Chrome smoke checks passed: direct list/detail shells, list-return links, browser back, exclusive sidebar highlighting, Settings tabs and Sharing placeholder, existing destinations, seeded meeting detail, and `/` redirect. New shells intentionally have no record loaders until ticket 2.

- [ ] 2.0 **Shared concept model and connected example data**
  - [ ] 2.1 Separate touchpoint identity/details from optional transcript/documentation and their processing states. Represent companies, people, and call/chat agent sessions as distinct linked records.
  - [ ] 2.2 Seed a small connected story: one company with several people, multiple touchpoints, an untranscribed meeting, a transcribed meeting, and both call and chat agent sessions. Include a session without a meeting link and a person without a company.
  - [ ] 2.3 Include examples of Phone Assistant and voice-memo documentation attached to a touchpoint; illustrate a newly encountered company/person without implementing auto-creation.
  - [ ] 2.4 Expose consistent read-only records to all routes using the existing SQLite/API/loader pattern. Preserve calendar metadata separately and avoid duplicate touchpoints across views.
  - [ ] 2.5 Capture the agreed concept definitions in `glossary.md`; record durable implementation decisions in `tasks/changelog.md` as tickets land.
  - **Done when:** The same IDs and relationships drive directories, hubs, meeting details, and session details; meetings and their participants do not depend on a transcript existing.
  - **Boundary:** Only enough model work to support this prototype, not a production CRM schema or identity-resolution system.

- [ ] 3.0 **Companies directory and company hub**
  - [ ] 3.1 Add a readable company directory linking to canonical company detail pages.
  - [ ] 3.2 Structure the company hub around Overview, People, Meetings, Agent Sessions, and Knowledge; use the seeded history to make the relationship's current context understandable.
  - [ ] 3.3 Show sample non-meeting knowledge such as internal notes and revenue context, distinct from individual meeting documentation.
  - [ ] 3.4 Link people, meetings, and sessions to their canonical detail pages. Include an explicitly nonfunctional company-scoped Analysis entry and a Sharing placeholder.
  - **Done when:** A user can start at a company, understand its context, and navigate to its people, touchpoints, and assistant conversations without encountering copied records.
  - **Boundary:** No company editing, computed health scores, live analysis, or knowledge ingestion.

- [ ] 4.0 **People directory and person hub**
  - [ ] 4.1 Add a people directory and a person hub using the same hierarchy as Companies: Overview, Meetings, Agent Sessions, and Knowledge.
  - [ ] 4.2 Show the linked company where available and the person's own discussion history, not every meeting with their company.
  - [ ] 4.3 Display sample person-specific context and link to canonical company, meeting, and session pages. Include person-scoped Analysis and Sharing placeholders.
  - **Done when:** A user can understand what was discussed with one person, traverse to their company, and distinguish customer contacts from internal Team users.
  - **Boundary:** No contact creation, editing, merging, enrichment, or full employment-history modeling.

- [ ] 5.0 **Meetings as touchpoints, not recordings**
  - [ ] 5.1 Reframe the existing meeting list and detail hierarchy around meetings/calls, with company and people links independent of transcription.
  - [ ] 5.2 Make the overview primary, with documentation and an optional transcript underneath. Keep touchpoint information distinct from artifact availability/processing status.
  - [ ] 5.3 Show related agent sessions and documentation source (e.g. Phone Assistant or voice memo) without implying that the assistant conversation is the customer meeting transcript.
  - [ ] 5.4 Keep Calendar navigation linked to the same touchpoint and retain calendar/invite metadata as supporting context. Include a selected-meeting Sharing placeholder.
  - **Done when:** An untranscribed meeting is a valid, understandable detail page—not a failed or perpetually processing recording—and the user can navigate Meeting → Company/Person/Agent Session.
  - **Boundary:** No recording pipeline, transcription, documentation editor, or sharing behavior.

- [ ] 6.0 **Agent Sessions directory and linked session details**
  - [ ] 6.1 Add a session directory with clear Call/Chat labels and linked company/person/meeting context where available.
  - [ ] 6.2 Add a read-only session detail page showing what the assistant conversation was about, representative conversation/documentation content, and links to related records.
  - [ ] 6.3 Make optional meeting linkage visible: sessions can exist independently, and their conversation content stays distinct from a related meeting's transcript.
  - [ ] 6.4 Walk the seeded story end to end: Company → Person → Meeting → Agent Session → Company. Check direct URLs, browser back, consistent labels, and valid no-transcript/no-meeting-link states.
  - **Done when:** Users can distinguish an assistant call from a customer call while following their relationship, and all cross-record navigation resolves consistently.
  - **Boundary:** No live calling/chat, assistant preparation workflow, or generated analysis.

## Suggested sequence

Ticket 1 establishes the navigable shell; ticket 2 supplies shared records. Tickets 3–6 then fill in the destinations, with the connected walkthrough closing ticket 6. Company/person links may target route shells until their corresponding pages are completed.

## Deferred / advanced work

- Automatic company/person creation, matching, deduplication, and all mutation flows.
- Functional sharing: all/company/person/selected-meeting scopes, organization or individual-peer recipients, and organization rules based on teams/customers/people. Placeholders must not imply that access is actually granted or enforced.
- AI questions over company/person histories, analysis results, and retrieval permissions.
- Knowledge editing/imports and actual reuse by Sales Assistant for preparation.
- Detailed interactions, production authorization, and backend integrations.
