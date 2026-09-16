# frontend-bliro

Frontend playground for building functional mockups and prototypes with the Bliro
design system — no monorepo, no auth, no real backend, but a router and a seeded
SQLite database so prototypes are populated with data that looks real.

## Run

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # typecheck + production build
npm run db:reset  # delete the seeded database; the next `dev` rebuilds it
```

## What's in here

| | |
|---|---|
| React 19 + TypeScript + Vite 8 | same major versions as `bliro/apps/web-app` |
| MUI v5 + Emotion | `@mui/material`, `@mui/system`, `@mui/x-date-pickers` v6 |
| Icons | `@mui/icons-material` and `lucide-react`, plus SVGR for `.svg` imports |
| `src/ui/` | verbatim copy of `bliro/libs/bliro-ui/src` — theme, tokens, Inter, logo, 21 components |
| `src/components/` | the generalizable slice of `bliro/apps/web-app/src/components` |
| `src/common-types/` | the handful of types those components import |
| `src/i18n/` | i18next + the real `common.json` locales (en, de) |
| `src/routes/` | the pages, and the `react-router` v8 route table |
| `src/mocks/` | fake state that isn't worth a database table |
| `server/` | the mock API, the SQLite schema/seed/queries, and the flag assets |

`/design-system` is a live reference page showing the palette, typography scale,
buttons and form controls. The other routes are mock product pages — copy one as
the starting point for whatever you are prototyping.

## Routing

`react-router` v8, the same version and package as `apps/web-app`, so a page moved
between the two doesn't change its imports. The route table is `src/routes/router.tsx`:

| route | |
|---|---|
| `/meetings` | list, with search and a status filter, both in the URL |
| `/meetings/:id` | summary, transcript, participants, link to the calendar entry |
| `/calendar` | entries grouped by day, filtered to upcoming / past / all |
| `/calendar/:id` | the invite, and the recording if there is one |
| `/team` | the org and its users |
| `/settings/account` | account preferences, phone assistant, VoiceID, account deletion |
| `/design-system` | the design-system reference page |

Pages get their data from **route loaders**, not a store — every page has its rows
before it first paints, which is what keeps the mockups from flashing through a
loading state. Anything that filters after the first paint (the meetings search box)
re-queries through `src/api/client.ts`.

## Mock data

`server/` is a small API that Vite mounts inside its own dev server, so `/api/*` and
the app share one origin and one `npm run dev` — there is no second process.

The database is **`node:sqlite`**, built into Node, so it costs no dependency and no
native build step. `server/data/playground.db` is gitignored and created on the first
request; if it is empty, `server/seed.ts` fills it.

| table | |
|---|---|
| `orgs` | one fictional customer |
| `users` | six colleagues — one deliberately has no calendar connected |
| `calendar_entries` + `calendar_participants` | Google and Microsoft invites, internal and external, with RSVPs |
| `meetings` | linked to a calendar entry **or** started ad hoc, with `recording` / `processing` / `completed` states |
| `transcript_segments` | speaker-attributed lines |

Everything is dated relative to the moment of seeding and shifted off weekends, so
the calendar always has a believable "today" no matter when you last reset it. Change
the fixtures in `server/seed.ts`, then `npm run db:reset` and restart.

The API is read-only (`GET /api/session`, `/api/users`, `/api/meetings`,
`/api/meetings/:id`, `/api/calendar`, `/api/calendar/:id`). Response shapes live in
`server/types.ts`; the client imports them with `import type` through the `@server/*`
alias, so the two sides share one definition without server code reaching the bundle.
Add a write endpoint in `server/api.ts` when a prototype needs one.

## Fake state

Not everything deserves a table. `src/mocks/` holds the state that only one page
reads:

- **`featureFlags.ts`** — a stand-in for the Amplitude-backed flag store, keyed on the
  **real** `FeatureFlagKey` enum from `common-types`. Gating a section on
  `useFeatureFlag(FeatureFlagKey.VoiceID)` here gates it on the same string in the
  monorepo. Flip the `OVERRIDES` to see a page in its other state.
- **`account.ts`** — the account preferences, phone-assistant and VoiceID fixtures the
  settings page edits, all local component state.

The rule of thumb: if more than one route reads it, or it needs to survive a reload,
put it in SQLite; otherwise put it here.

## The design system

Imports use the **same `@bliro/ui/*` alias as the monorepo**, so a component pasted
out of `bliro/apps/web-app` or `bliro/libs/bliro-ui` resolves here without editing a
single import line.

```tsx
import { colors } from "@bliro/ui/theme/colors";
import { fontWeight } from "@bliro/ui/theme/fonts";
import { Input } from "@bliro/ui/components/Input";
import { IconName } from "@bliro/common-types/icon/IconName";
import { Icon } from "@bliro/web-app/components/Icon";
```

Four aliases, three of them deliberately identical to the monorepo's:

| alias | resolves to |
|---|---|
| `@bliro/ui/*` | `src/ui/*` |
| `@bliro/web-app/*` | `src/*` |
| `@bliro/common-types/*` | `src/common-types/*` |
| `@/*` | `src/*` (for your own playground code) |

Two parallel sources for the same palette, mirroring the main app:

- **`@bliro/ui/theme/colors`** — the `colors` object, for `sx` props and inline styles.
- **`@bliro/ui/theme.css`** — `--bliro-orange-1` … CSS custom properties, for CSS Modules.

Typography goes through MUI's `Typography` with the custom variants the theme adds:
`h0`–`h4`, `subtitle0`–`subtitle4`, `xxSmallTitle`→`largeTitle`, `xxSmallBody`→`largeBody`.

Styling follows the web-app's mix: `sx={{}}` for one-offs, `*.module.css` for anything
reused. `styled()` is essentially unused in the real app — don't start here.

## App components

`src/components/` holds the web-app components that carry no Redux, Auth0, router or
API coupling — the ones that are actually reusable in a mockup:

- **`Icon`** — the 600+ name registry mapping `IconName` to lucide icons.
- **`utils/CustomIcon`** — brand and integration logos (Google, Microsoft, HubSpot,
  Salesforce, Slack, Teams, Bliro…) as inline SVGs.
- **`Reusable/`** — `BannerCard`, `Divider`, `ConfirmDialog`, `WarningBanner`,
  `IntegrationExpiredBanner`, `ModalCloseButton`, `SearchToggleButton`, and the
  `Loading*` / `PartialLoading` / `FullscreenLoading` family.
- **`DropDownSelect`**, **`Templates`**, **`TabItem`**, **`PanelError`**,
  **`PanelWarning`**, **`SpeakerChange`**, **`SendStatusBadge`**, **`ErrorScreen`**,
  **`LanguagePicker`**, **`LanguageFlagIcon`**, **`IntegrationDisplay`**,
  **`VcardQrCode`**.

Deliberately **not** copied, because they are wired to state the playground does not
have — pull them in by hand if a prototype genuinely needs one:

`CallPanel`, `Settings`, `Sidebar`, `NavBar`, `Modals`, `Filters`, `SyncTo`,
`PeopleSearch`, `Onboarding`, `PhoneAgentOnboarding`, `LicenseGate`, `DeepLink`,
`MeetVoiceIdBanner`, `LoginError`, `AccountSuspendedGate`, `ContentEditor`,
`Reusable/LicenseLockedCard`, `Reusable/LicenseLockTooltip`.

`src/redux/api.ts` is a one-line stub. `LanguageFlagIcon` builds its `<img src>` from
`apiBaseUrl`, which is now the empty string — same origin, where `server/flags.ts`
answers `/flags/<code>.svg` out of the `flag-icons` package exactly as the real
backend does, including the two overrides (`esperanto`, `ru-ba`) that package does
not ship. So the language pickers render real flags.

## Keeping in sync

`src/ui/` is a **snapshot**, deliberately not a dependency. To refresh it from the
monorepo:

```bash
rsync -a --delete ~/dev/bliro/libs/bliro-ui/src/ \
  ~/dev/frontend-bliro/src/ui/ \
  --exclude '*.test.tsx' --exclude 'setupTests.ts'
```

`src/components/` is a hand-picked subset, so refresh those per folder rather than
with `--delete`.

Then re-run `npm run typecheck`, and add any new third-party dependency the copied
components pulled in (`react-international-phone` was one such surprise).

## Notes

- **`.npmrc` sets `legacy-peer-deps`** — `@mui/x-date-pickers` v6 still declares a
  React 17/18 peer range. pnpm only warns, which is why the monorepo ships this exact
  combination; npm refuses without the flag.
- **`vite.config.ts` sets `legacy.inconsistentCjsInterop`** — the same escape hatch
  `apps/web-app` uses. Without it, Vite 8's CJS default-import interop makes
  `@mui/icons-material` imports render as objects. Drop it when MUI goes v6+.
- **`server/` imports its siblings with explicit `.ts` extensions** — `vite.config.ts`
  pulls the API in, and Vite's native config loader (planned to become the default)
  warns about extensionless relative imports. `allowImportingTsExtensions` in
  `tsconfig.json` is what lets TypeScript accept them.
- No Storybook, no test runner. Add them if a prototype ever outgrows this.
