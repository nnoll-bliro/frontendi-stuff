import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Ticket 5: a meeting is a touchpoint, not a recording. These tests assert that an
 * untranscribed meeting is a complete record, that company/people links never depend
 * on transcription, and that assistant conversations stay distinct from transcripts.
 */

let pageErrors: Error[] = [];
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));
});

test.afterEach(async () => {
  expect(
    pageErrors.map((error) => error.message),
    "the page should not emit uncaught errors",
  ).toEqual([]);
});

const region = (page: Page, name: string): Locator =>
  page.getByRole("main").getByRole("region", { name, exact: true });

test("an untranscribed call is a valid, complete touchpoint", async ({ page }) => {
  await page.goto("/meetings/mtg_halden_depot");
  const main = page.getByRole("main");

  await expect(
    main.getByRole("heading", { name: "Halden Logistics — Depot follow-up", level: 1 }),
  ).toBeVisible();
  // The touchpoint's own lifecycle, not an artifact state.
  await expect(main).toContainText("Customer call");
  await expect(main).toContainText("Held");

  // Overview comes first and carries the substance.
  await expect(region(page, "Overview")).toContainText("Ruben confirmed the pilot depot");

  // A missing transcript is a valid state, not a failure or a pending job.
  const transcript = region(page, "Transcript");
  await expect(transcript).toContainText("No transcript");
  await expect(transcript).toContainText("Nothing is processing or missing");
  await expect(transcript).not.toContainText("Failed");
  await expect(transcript).not.toContainText("Processing");
});

test("company and people links do not depend on transcription", async ({ page }) => {
  await page.goto("/meetings/mtg_halden_depot");
  const people = region(page, "Company and people");

  await expect(people.getByRole("link", { name: "Halden Logistics", exact: true })).toHaveAttribute(
    "href",
    "/companies/co_halden",
  );
  await expect(people.getByRole("link", { name: "Ruben Holt", exact: true })).toHaveAttribute(
    "href",
    "/people/per_ruben",
  );
  // The internal owner is a participant but not a customer record.
  await expect(people).toContainText("Internal");

  // A touchpoint without a company is still valid.
  await page.goto("/meetings/mtg_avery_advice");
  const avery = region(page, "Company and people");
  await expect(avery).toContainText("No company linked");
  await expect(avery.getByRole("link", { name: "Avery Morgan", exact: true })).toHaveAttribute(
    "href",
    "/people/per_avery",
  );
});

test("documentation names its source without claiming to be a transcript", async ({ page }) => {
  await page.goto("/meetings/mtg_halden_depot");
  const documentation = region(page, "Documentation");

  await expect(documentation).toContainText("Source: Phone Assistant");
  await expect(documentation).toContainText("is not this meeting's transcript");
  await expect(
    documentation.getByRole("link", { name: "Captured in this assistant session" }),
  ).toHaveAttribute("href", "/agent-sessions/as_halden_debrief");

  await page.goto("/meetings/mtg_nordlicht_intro");
  await expect(region(page, "Documentation")).toContainText("Source: Voice memo");
  await expect(region(page, "Documentation")).toContainText("documents the meeting rather than");
});

test("related agent sessions are shown as separate conversations", async ({ page }) => {
  await page.goto("/meetings/mtg_halden_depot");
  const sessions = region(page, "Agent Sessions");

  await expect(sessions).toContainText("not a recording of this meeting");
  await expect(
    sessions.getByRole("link", { name: "Document Ruben's depot call", exact: true }),
  ).toHaveAttribute("href", "/agent-sessions/as_halden_debrief");
  await expect(sessions).toContainText("Call");

  // An account-level chat has no meeting link, so it is not listed here.
  await expect(sessions).not.toContainText("Plan Halden account follow-up");
});

test("calendar entry stays supporting context on both sides of the link", async ({ page }) => {
  const main = page.getByRole("main");

  // A calendar-sourced meeting keeps its invite metadata as context.
  await page.goto("/meetings/mtg_halden_discovery");
  const calendar = region(page, "Calendar entry");
  await expect(calendar).toContainText("not a second meeting record");
  await calendar.getByRole("link").first().click();
  await expect(page).toHaveURL("/calendar/cal_halden_discovery");

  // And the invite points back at the same canonical touchpoint.
  await main.getByRole("link", { name: "Open meeting", exact: true }).click();
  await expect(page).toHaveURL("/meetings/mtg_halden_discovery");

  // An ad hoc touchpoint has no invite, stated plainly.
  await page.goto("/meetings/mtg_halden_depot");
  await expect(region(page, "Calendar entry")).toContainText("added independently of the calendar");
});

test("the selected-meeting sharing placeholder grants nothing", async ({ page }) => {
  await page.goto("/meetings/mtg_halden_depot");
  const sharing = region(page, "Sharing");

  await expect(sharing).toContainText("No access is granted, changed, or enforced here.");
  await expect(sharing).toContainText("Selected-meeting scope");
  await expect(
    sharing.getByRole("link", { name: "Organization sharing policies · Future" }),
  ).toHaveAttribute("href", "/settings/sharing");
});

test("the meetings directory reads as touchpoints and returns from a detail page", async ({
  page,
}) => {
  await page.goto("/meetings");
  const main = page.getByRole("main");

  const depot = main
    .getByRole("link", { name: "Halden Logistics — Depot follow-up", exact: true })
    .first();
  await expect(depot).toHaveAttribute("href", "/meetings/mtg_halden_depot");
  await expect(main).toContainText("Customer call");
  await expect(main).toContainText("No transcript");

  // Company and person links are reachable straight from the row.
  await expect(
    main.getByRole("link", { name: "Halden Logistics", exact: true }).first(),
  ).toHaveAttribute("href", "/companies/co_halden");

  await depot.click();
  await expect(page).toHaveURL("/meetings/mtg_halden_depot");
  await main.getByRole("link", { name: "Back to Meetings", exact: true }).click();
  await expect(page).toHaveURL("/meetings");
});

test("Meeting → Company → Person → Meeting resolves consistently", async ({ page }) => {
  const main = page.getByRole("main");
  await page.goto("/meetings/mtg_halden_depot");

  await region(page, "Company and people")
    .getByRole("link", { name: "Halden Logistics", exact: true })
    .click();
  await expect(page).toHaveURL("/companies/co_halden");

  await region(page, "People").getByRole("link", { name: "Ruben Holt", exact: true }).click();
  await expect(page).toHaveURL("/people/per_ruben");

  await region(page, "Meetings")
    .getByRole("link", { name: "Halden Logistics — Depot follow-up", exact: true })
    .click();
  await expect(page).toHaveURL("/meetings/mtg_halden_depot");
  await expect(
    main.getByRole("heading", { name: "Halden Logistics — Depot follow-up", level: 1 }),
  ).toBeVisible();

  await page.goBack();
  await expect(main.getByRole("heading", { name: "Ruben Holt", level: 1 })).toBeVisible();
});
