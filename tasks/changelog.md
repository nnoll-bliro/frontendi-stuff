# Task Changelog

Dated history of meaningful task work and decisions.

## 2026-09-17

- Completed ticket 1 of `tasks/todo/tasks-lightweight-crm-ui.md`: primary Companies, People, Meetings, and Agent Sessions navigation; retained Calendar; separated Team/Settings and the design-system utility.
- Added temporary list/detail shells in `src/routes/CrmRouteShell.tsx`, with explicit unconnected-data messaging, hub section headings, and canonical list-return links. No fake IDs or duplicate fixtures were introduced; loaders and record validation remain part of ticket 2. Existing Meetings and Calendar pages retain their loaders until their later tickets.
- Added shared Settings navigation and `/settings/sharing`, clearly labeled as a future capability with no policy controls or access-enforcement claims. Kept `/settings` redirecting to Account and `/` redirecting to Meetings.
- Validation: `npm run build` (including TypeScript) and Chrome/Playwright smoke checks passed for shell direct URLs, list-return links, browser back, exclusive sidebar highlighting, Settings navigation, retained destinations, seeded meeting detail, and the root redirect. Build reports dependency `lottie-web` eval and large-bundle warnings; no uncaught browser errors observed. Browser tooling ran from `/tmp/crm-nav-smoke` without adding project dependencies.
