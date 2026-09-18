# Bliro product design system

This library started as a copy of `bliro-ui` and now evolves here. Shared improvements
belong in `src/ui`; business-specific compositions stay in `src/components` and routes.
Do not overwrite this directory with a monorepo snapshot. Review and merge upstream
changes, and port reusable improvements back deliberately.

## Product language

- Keep Inter and the Bliro palette. Use orange for primary actions and selected
  navigation, not every piece of text. Reserve status colors for actual states.
- A page has one `h1`, one short purpose statement, and an optional primary action.
  Use `PageHeader` with `pageTitle` (28/36, semibold). Existing display variants remain
  available for display/marketing use, not routine record sections.
- Use `SectionHeader` with `sectionTitle` (16/24, semibold) and an optional count.
  Body copy is usually `smallBody` (14/22); supporting metadata is `xSmallBody` (13/18).
  `eyebrow` is for short category labels, never paragraphs.
- Use a 4/8px spacing rhythm: 8px within tight groups, 16–24px within surfaces,
  32px after a page header, 40px between major sections. MUI spacing remains 8px.
- A `Surface` groups a single purpose with an 8px radius, subtle border, and no shadow.
  A `SurfaceList` groups repeated `Surface` children with dividers, avoiding repeated
  rounded card outlines. Do not use a surface around every label or text block.
- Keep record titles prominent and supporting context quieter. Use short explanations
  while preserving source, lifecycle, and ownership distinctions. Label future
  capabilities as unavailable; never make a placeholder look operational.
- Stack actions and columns at small widths. Keep text wrapping and keyboard focus
  visible. `interactive` on a surface only supplies styling: use a real link or button
  for interaction, and avoid nested links.

## Sources and APIs

- `theme/colors.ts` and `theme.css`: existing brand palette for TS and CSS consumers.
- `theme/tokens.ts`: semantic product colors, spacing, radii, layout widths, focus ring.
- `theme/index.ts`: MUI typography, controls, focus styles, reduced-motion support.
- `components/PageHeader`, `components/SectionHeader`: reusable heading hierarchy.
- `components/Surface`: `Surface` and `SurfaceList`; both accept MUI `BoxProps` and `sx`
  (including arrays and theme callbacks). They do not prescribe CRM data or routing.
- `components/Input`: explicit or generated input IDs, associated labels and error
  messages, visible focus, and shrinkable input sizing.
- `components/NavMenuItem`: full/collapsed navigation, `aria-current` on active links,
  keyboard focus, and existing disabled/locked states.

`/design-system` is the live reference for product patterns, spacing, typography,
colors, and controls. Add examples there when extending the library.

## Validation

Run `npm run build`, `npm test`, and `npm run test:ui`. If Playwright Chromium is not
installed, use `PLAYWRIGHT_CHANNEL=chrome npm run test:ui` with local Google Chrome.
`tests/design-language.spec.ts` checks desktop/tablet/mobile overflow, active collapsed
navigation, input labels, keyboard filters, and representative shared styles.
